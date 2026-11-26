import {UserModel} from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import type {NextFunction, Response} from "express";
import {HTTPError} from "../utils/HttpError.js";
import type {ITokenRequest} from "../interfaces/ITokenReq.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";

export const authenticateToken = async (
  req: ITokenRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.token;
    if (!token) throw new HTTPError("Unauthorized user", 401);

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    if (typeof decoded === "string" || typeof decoded._id !== "string") {
      throw new HTTPError("Unauthorized user", 401);
    }
    const account = await UserModel.findById(decoded._id).select("role deactivated").lean();
    if (!account || account.deactivated) throw new HTTPError("Unauthorized user", 401);
    req.user = {...decoded, role: account.role};
    next();
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to authenticate request.");
  }
};
