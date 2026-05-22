import type {Request, Response} from "express";
import {getUserCount} from "../services/admin.service.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";

export const getUserCountController = async (req: Request, res: Response) => {
  try {
    const count = await getUserCount();
    return res
      .status(200)
      .json({message: "User count fetched successfully", count});
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to fetch user count.");
  }
};
