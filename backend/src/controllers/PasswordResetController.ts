import type {Request, Response} from "express";
import {requestPasswordReset, resetPassword, verifyResetCode} from "../services/passwordReset.service.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";

export async function forgotPasswordController(req: Request, res: Response) {
  try {
    return res.status(200).json(await requestPasswordReset(req.body?.email));
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to request password reset.");
  }
}

export async function resetPasswordController(req: Request, res: Response) {
  try {
    const {email, resetToken, password, confirmPassword} = req.body ?? {};
    return res.status(200).json(await resetPassword(email, resetToken, password, confirmPassword));
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to reset password.");
  }
}

export async function verifyResetCodeController(req: Request, res: Response) {
  try {
    return res.status(200).json(await verifyResetCode(req.body?.email, req.body?.otp));
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to verify reset code.");
  }
}
