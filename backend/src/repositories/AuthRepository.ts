import type {Request, Response} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import {UserModel} from "../models/UserModel.js";
import {HTTPError} from "../utils/HttpError.js";

class AuthRepository {

    // create interfaces for the parameters
    async Register(data: any) {
            const hashedPassword = await bcrypt.hash(data.password, 10);

            const existingUser = await UserModel.findOne({
              email: data.email,
            });
            if (existingUser) {
              throw new Error("Email already used.");
            }

            const userAccount = await UserModel.create({
              email: data.email,
              hashedPassword: hashedPassword,
            });

            const user = await UserModel.create({
              _id: userAccount._id,
            });

            return user;
    }
    
    async Login(data: any) {
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