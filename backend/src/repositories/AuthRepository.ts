import bcrypt from "bcrypt";
import {UserModel} from "../models/UserModel.js";
import type {IUserInterface} from "../interfaces/IUser.js";

export class AuthRepository {
  async register(data: IUserInterface) {
    // const hashedPassword = await bcrypt.hash(data.rawPassword, 10);
    const hashedPassword = data.rawPassword;

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
}
