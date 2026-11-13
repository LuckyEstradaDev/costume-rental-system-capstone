import type { IOTPVerification } from "../interfaces/IOTPVerification.js";
import { OTPRepository } from "../repositories/OTPRepository.js";
import { HTTPError } from "../utils/HttpError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const verifyOTPService = async (userId: string, rawOTP: string, purpose: IOTPVerification["purpose"], email: string) => {
    const otpRepo = new OTPRepository();
    const otpRecord = await otpRepo.getByUserID(userId, purpose, "PENDING");
    console.log(otpRecord)
    const isOTPValid = otpRecord && await bcrypt.compare(rawOTP, otpRecord.otpHash);
    let token;

    if (!isOTPValid) {
        throw new HTTPError("Invalid OTP", 400);
    } else if (otpRecord && otpRecord.expiresAt < new Date()) {
        throw new HTTPError("OTP has expired", 400);
    }

    if (otpRecord.status === "PENDING" && isOTPValid && otpRecord.purpose === "ACCOUNT_VERIFICATION") {
        token = jwt.sign(
        {_id: userId, email: email},
        process.env.ACCESS_TOKEN_SECRET!,
        );  
        await otpRepo.update(otpRecord._id.toString(), { status: "USED" });
    }
    return  {token};
}