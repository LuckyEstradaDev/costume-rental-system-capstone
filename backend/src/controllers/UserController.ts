import type {Request, Response} from "express";
import {getRentsAndOrdersByUserIdService} from "../services/user.service.js";

export const getRentsAndOrdersByUserId = async (
  req: Request,
  res: Response,
) => {
  const userId = req.params.id as string;
  try {
    const data = await getRentsAndOrdersByUserIdService(userId);
    res.status(200).json({message: "Data fetched successfully", data});
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "An error occurred while fetching data.",
    });
  }
};
