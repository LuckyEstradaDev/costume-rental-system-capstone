import {registerService} from "../services/auth.service.js";
import type {Request, Response} from "express";

export const registerController = async (req: Request, res: Response) => {
  try {
    await registerService(req.body);
    return res.status(200).json({message: "Account created successfully."});
  } catch (error: any) {
    return res.status(500).json({message: error.message});
  }
};
