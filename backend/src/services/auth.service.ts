import type {IUserInterface} from "../interfaces/IUser.js";
import {UserModel} from "../models/UserModel.js";
import {AuthRepository} from "../repositories/AuthRepository.js";

let authRepository = new AuthRepository();

export const registerService = async (data: IUserInterface) => {
  const existingUser = await UserModel.findOne({
    email: data.email,
  });

  if (existingUser) {
    throw new Error("Email already used.");
  }

  authRepository.register(data);
};
