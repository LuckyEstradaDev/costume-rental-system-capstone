import jwt from "jsonwebtoken";
import type {NextFunction, Response} from "express";
import {HTTPError} from "../utils/HttpError.js";
import type {ITokenRequest} from "../interfaces/ITokenReq.js";

export const authenticateToken = (
  req: ITokenRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.token;
    if (!token) throw new HTTPError("Unauthorized user", 401);

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    req.user = decoded; // attach user data
    next();
  } catch (err: any) {
    return res.status(err.status || 500).json({message: err.message});
  }
};
