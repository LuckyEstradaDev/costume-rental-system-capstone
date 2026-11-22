import bcrypt from "bcrypt";
import {UserModel} from "../models/UserModel.js";
import type {
  IUserInterface,
  IUserAddressInterface,
} from "../interfaces/IUser.js";

export class AuthRepository {
  async issuePasswordReset(id: string, hash: string, expiresAt: Date) {
    return UserModel.findOneAndUpdate(
      {_id: id, $or: [
        {"passwordReset.requestedAt": {$lte: new Date(Date.now() - 60_000)}},
        {passwordReset: {$exists: false}},
      ]},
      {$set: {passwordReset: {hash, expiresAt, requestedAt: new Date(), attempts: 0}}},
      {new: true},
    );
  }

  async reserveResetAttempt(email: string) {
    return UserModel.findOneAndUpdate(
      {email, "passwordReset.expiresAt": {$gt: new Date()}, "passwordReset.attempts": {$lt: 5},
        "passwordReset.verifiedTokenHash": {$exists: false}},
      {$inc: {"passwordReset.attempts": 1}},
      {new: true},
    ).select("+passwordReset");
  }

  async verifyPasswordReset(id: string, codeHash: string, tokenHash: string) {
    return UserModel.findOneAndUpdate(
      {_id: id, "passwordReset.hash": codeHash, "passwordReset.expiresAt": {$gt: new Date()},
        "passwordReset.verifiedTokenHash": {$exists: false}},
      {$set: {"passwordReset.verifiedTokenHash": tokenHash}},
      {new: true},
    );
  }

  async completePasswordReset(email: string, tokenHash: string, hashedPassword: string) {
    return UserModel.findOneAndUpdate(
      {email, "passwordReset.verifiedTokenHash": tokenHash, "passwordReset.expiresAt": {$gt: new Date()}},
      {$set: {hashedPassword}, $unset: {passwordReset: ""}},
      {new: true},
    );
  }

  async register(data: IUserInterface) {
    const hashedPassword = await bcrypt.hash(data.rawPassword, 10);
    const registration: IUserInterface & {passwordReset?: unknown} = data;
    const {notifications, passwordReset, ...userData} = registration;
    
    const user = await UserModel.create({
      ...userData,
      hashedPassword: hashedPassword,
    });

    return user;
  }

  async findByEmail(email: string) {
    return UserModel.findOne({
      email: email,
    });
  }

  async findUserById(id: string) {
    return UserModel.findById(id);
  }

  async updateProfile(
    id: string,
    update: Record<string, unknown>,
  ) {
    const operations: Record<string, unknown> = {};
    const set: Record<string, unknown> = {};
    const unset: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(update)) {
      if (key === "address") {
        if (value === null) {
          unset.address = "";
        } else {
          set.address = value as IUserAddressInterface;
        }
        continue;
      }

      if (value === null) {
        unset[key] = "";
      } else if (value !== undefined) {
        set[key] = value;
      }
    }

    if (Object.keys(set).length > 0) {
      operations.$set = set;
    }

    if (Object.keys(unset).length > 0) {
      operations.$unset = unset;
    }

    return UserModel.findByIdAndUpdate(id, operations, {
      new: true,
      runValidators: true,
    });
  }
}
