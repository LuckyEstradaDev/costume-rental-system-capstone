import {api} from "@/lib/axios";
import type {
  IResendOTPRequest,
  IResendOTPResponse,
  IVerifyOTPRequest,
} from "../types/IOTPVerification";

export const verifyOTPService = async (data: IVerifyOTPRequest) => {
  const res = await api.post<{message: string}>("/api/otp/verify", data);
  return res.data;
};

export const resendOTPService = async (
  data: IResendOTPRequest,
): Promise<IResendOTPResponse> => {
  const res = await api.post<IResendOTPResponse>("/api/otp/resend", data);
  return res.data;
};
