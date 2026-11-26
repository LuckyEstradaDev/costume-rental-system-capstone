import type {NextFunction, Response} from "express";
import type {ITokenRequest} from "../interfaces/ITokenReq.js";

export const requireAccountRole = (...roles: string[]) =>
  (req: ITokenRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({message: "Access denied."});
    }
    next();
  };
