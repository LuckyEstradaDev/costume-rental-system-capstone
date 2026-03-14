import type {Request, Response} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {UserModel} from "../models/UserModel.js";
import {HTTPError} from "../utils/HttpError.js";
import type {IUserInterface, IUserLoginInterface} from "../interfaces/IUser.js";

export class AuthRepository {
  async register(data: IUserInterface) {
    const hashedPassword = await bcrypt.hash(data.rawPassword, 10);

    const user = await UserModel.create({
      ...data,
      hashedPassword: hashedPassword,
    });

    return user;
  }
}
