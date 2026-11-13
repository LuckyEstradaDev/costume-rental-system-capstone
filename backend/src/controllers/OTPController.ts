import type {Request, Response} from "express";
import type { IOTPVerification } from "../interfaces/IOTPVerification.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import { resendOTPService, verifyOTPService } from "../services/otp.service.js";

const OTP_PURPOSES = [
  "ACCOUNT_VERIFICATION",
  "PASSWORD_RESET",
  "EMAIL_CHANGE",
] as const;

const isOTPPurpose = (
  value: unknown,
): value is IOTPVerification["purpose"] =>
  typeof value === "string" && OTP_PURPOSES.some((purpose) => purpose === value);
import { HTTPError } from "../utils/HttpError.js";

export const verifyOTPController = async (req: Request, res: Response) => {
  try {
        const { userId, otp, purpose, email } = req.body;
        const {token} = await verifyOTPService(userId, otp, purpose, email);

        if (purpose === "ACCOUNT_VERIFICATION" && token) {
            // Send it as HttpOnly cookie
            res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 60 * 60 * 1000, // 1 hour
            });

            return res.status(200).json({ message: "OTP verified successfully." });
        } else {
          throw new HTTPError("Server error: Token not generated for account verification.", 500);
        }

    } catch (error) {
    sendErrorResponse(res, error, "Failed to verify OTP");
  }
}

export const resendOTPController = async (req: Request, res: Response) => {
  try {
    const {userId, email, purpose} = req.body;

    if (
      typeof userId !== "string" ||
      typeof email !== "string" ||
      !isOTPPurpose(purpose)
    ) {
      return res
        .status(400)
        .json({message: "userId, email and purpose are required."});
    }

    const result = await resendOTPService(userId, email, purpose);
    return res.status(200).json(result);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to resend OTP.");
  }
}