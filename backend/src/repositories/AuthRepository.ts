import type {Request, Response} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {UserModel} from "../models/UserModel.js";
import {HTTPError} from "../utils/HttpError.js";
import type {IUserInterface} from "../interfaces/IUser.js";

export class AuthRepository {
  async register(data: IUserInterface) {
    const hashedPassword = await bcrypt.hash(data.hashedPassword, 10);

    const user = await UserModel.create({
      ...data,
      hashedPassword: hashedPassword,
    });

    return user;
  }

  async login(data: any) {
    const user = await UserModel.findOne({email: data.email});
    if (!user) throw new HTTPError("Email does not exist", 404);

    const isMatch = await bcrypt.compare(data.password, user.hashedPassword);

    if (!isMatch) throw new HTTPError("Incorrect password", 401);

    const token = jwt.sign(
      {_id: user.id, email: user.email},
      process.env.ACCESS_TOKEN_SECRET!,
    );

    return {token, user};
  }
}
