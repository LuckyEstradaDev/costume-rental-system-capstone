import {api} from "@/lib/axios";

export async function requestPasswordReset(email: string): Promise<void> {
  await api.post("/api/auth/forgot-password", {email});
}

export async function resetPassword(data: {
  email: string;
  resetToken: string;
  password: string;
  confirmPassword: string;
}): Promise<void> {
  await api.post("/api/auth/reset-password", data);
}

export async function verifyResetCode(email: string, otp: string): Promise<string> {
  const {data} = await api.post<{resetToken: string}>("/api/auth/verify-reset-code", {email, otp});
  return data.resetToken;
}
