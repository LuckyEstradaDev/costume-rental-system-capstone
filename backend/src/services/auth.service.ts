import type {IUserInterface, IUserLoginInterface} from "../interfaces/IUser.js";
import {UserModel} from "../models/UserModel.js";
import {AuthRepository} from "../repositories/AuthRepository.js";
import {HTTPError} from "../utils/HttpError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

export const loginService = async (data: IUserLoginInterface) => {
  const user = await UserModel.findOne({email: data.email});
  if (!user) throw new HTTPError("Email does not exist", 404);

  const isMatch = await bcrypt.compare(data.rawPassword, user.hashedPassword);

  if (!isMatch) throw new HTTPError("Incorrect password", 401);

  const token = jwt.sign(
    {_id: user.id, email: user.email},
    process.env.ACCESS_TOKEN_SECRET!,
  );

  return {token, user};
};
