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
    update: {address?: IUserAddressInterface | null},
  ) {
    const operations: Record<string, unknown> = {};

    if (update.address === null) {
      operations.$unset = {address: ""};
    } else if (update.address !== undefined) {
      operations.$set = {address: update.address};
    }

    return UserModel.findByIdAndUpdate(id, operations, {
      new: true,
      runValidators: true,
    });
  }
}
