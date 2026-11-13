import type { IOTPVerification } from "../interfaces/IOTPVerification.js";
import { OTPModel } from "../models/OTPModel.js";

export class OTPRepository {
    async create(otpData: Partial<IOTPVerification>) {
        const otp = await OTPModel.create(otpData);
        return otp;
    }

    async getByUserID(id: string, purpose: IOTPVerification["purpose"], status: IOTPVerification["status"]) {
        const otp = await OTPModel.findOne({userId: id, purpose, status}).sort({ createdAt: -1 }).lean();
        return otp;
    }

    async update(id: string, updateData: Partial<IOTPVerification>) {
        return await OTPModel.findByIdAndUpdate(id, updateData, { new: true });
    }
}