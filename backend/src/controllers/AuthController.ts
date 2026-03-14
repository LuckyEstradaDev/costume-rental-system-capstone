import {registerService, loginService} from "../services/auth.service.js";
import type {Request, Response} from "express";

export const registerController = async (req: Request, res: Response) => {
  try {
    await registerService(req.body);
    return res.status(200).json({message: "Account created successfully."});
  } catch (error: any) {
    return res.status(500).json({message: error.message});
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const {token, user} = await loginService(req.body);
    // Send it as HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    return res.status(200).json({message: "Logged in successfully."});
  } catch (error: any) {
    return res.status(500).json({message: error.message});
  }
};

export const signOutController = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({message: "Successfully signed out"});
  } catch (error) {
    return res.status(500).json({message: "Sign out failed"});
  }
};
