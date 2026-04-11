import type {IUserInterface, IUserLoginInterface} from "../interfaces/IUser.js";
import {UserModel} from "../models/UserModel.js";
import {AuthRepository} from "../repositories/AuthRepository.js";
import {HTTPError} from "../utils/HttpError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

let authRepository = new AuthRepository();

export const registerService = async (data: IUserInterface) => {
  data.email = data.email.trim().toLowerCase();
  const existingUser = await authRepository.findByEmail(data.email);

  if (existingUser) {
    throw new Error("Email already used.");
  }

  await authRepository.register(data);
};

export const loginService = async (data: IUserLoginInterface) => {
  data.email = data.email.trim().toLowerCase();
  const user = await authRepository.findByEmail(data.email);
  if (!user) throw new HTTPError("Email does not exist", 404);

  // const isMatch = await bcrypt.compare(data.rawPassword, user.hashedPassword);
  const isMatch = data.rawPassword === user.hashedPassword;

  if (!isMatch) throw new HTTPError("Incorrect password", 401);

  const token = jwt.sign(
    {_id: user.id, email: user.email},
    process.env.ACCESS_TOKEN_SECRET!,
  );

  return {token, user};
};

export const verifyMe = async (id: string) => {
  const user = await authRepository.findUserById(id);
  if (!user) throw new HTTPError("User does not exist", 404);
  return {user};
};
