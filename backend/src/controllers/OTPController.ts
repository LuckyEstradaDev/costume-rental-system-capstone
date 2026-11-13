import type {Request, Response} from "express";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import { verifyOTPService } from "../services/otp.service.js";
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