import type { IOTPVerification } from "../interfaces/IOTPVerification.js";
import { OTPRepository } from "../repositories/OTPRepository.js";
import { AuthRepository } from "../repositories/AuthRepository.js";
import { HTTPError } from "../utils/HttpError.js";
import { sendOTPEmail } from "./email.service.js";
import { OTP_EXPIRY_MS } from "../config/otp.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const verifyOTPService = async (userId: string, rawOTP: string, purpose: IOTPVerification["purpose"], email: string) => {
    const otpRepo = new OTPRepository();
    const otpRecord = await otpRepo.getByUserID(userId, purpose, "PENDING");
    const isCorrect = otpRecord && await bcrypt.compare(rawOTP, otpRecord.otpHash);
    let token;

    if (!otpRecord) {
        throw new HTTPError("No pending verification code found for this user.", 404);
    }

    if (otpRecord.status === "USED") {
        throw new HTTPError("This verification code has already been used.", 400);
    } else if (otpRecord.status === "INVALIDATED") {
        throw new HTTPError("This verification code has been invalidated. Please request a new one.", 400);
    } else if (!isCorrect) {
        throw new HTTPError("The verification code is incorrect. Please try again.", 400);
    } else if (otpRecord && otpRecord.expiresAt < new Date()) {
        throw new HTTPError("The verification code has expired, please request a new one.", 400);
    }

    if (otpRecord.status === "PENDING" && isCorrect && otpRecord.purpose === "ACCOUNT_VERIFICATION") {
        token = jwt.sign(
        {_id: userId, email: email},
        process.env.ACCESS_TOKEN_SECRET!,
        );  
        await otpRepo.update(otpRecord._id.toString(), { status: "USED" });
    }
    return  {token};
}

export const resendOTPService = async (
    userId: string,
    email: string,
    purpose: IOTPVerification["purpose"],
) => {
    const authRepo = new AuthRepository();
    const user = await authRepo.findUserById(userId);

    if (!user) {
        throw new HTTPError("User does not exist", 404);
    }

    if (user.email !== email.trim().toLowerCase()) {
        throw new HTTPError("Email does not match this account", 400);
    }

    const otpRepo = new OTPRepository();
    await otpRepo.invalidatePending(userId, purpose);

    const rawOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(rawOTP, 10);
    await otpRepo.create({userId, email: user.email, otpHash: hashedOTP, status: "PENDING", purpose, expiresAt: new Date(Date.now() + OTP_EXPIRY_MS)});

    await sendOTPEmail({to: user.email, otp: rawOTP, name: user.firstName, purpose});

    return {message: "A new verification code has been sent."};
};