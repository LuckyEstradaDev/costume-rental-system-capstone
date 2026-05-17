import jwt from "jsonwebtoken";
import type {NextFunction, Response} from "express";
import {HTTPError} from "../utils/HttpError.js";
import type {ITokenRequest} from "../interfaces/ITokenReq.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";

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
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to authenticate request.");
  }
};
