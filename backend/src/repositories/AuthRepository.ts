import bcrypt from "bcrypt";
import {UserModel} from "../models/UserModel.js";
import type {
  IUserInterface,
  IUserAddressInterface,
} from "../interfaces/IUser.js";

export class AuthRepository {
  async register(data: IUserInterface) {
    const hashedPassword = await bcrypt.hash(data.rawPassword, 10);
    // const hashedPassword = data.rawPassword;

    const user = await UserModel.create({
      ...data,
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
