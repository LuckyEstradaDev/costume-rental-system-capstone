/** Mirrors backend/src/interfaces/IOTPVerification.ts */
export type OTPStatus =
  | "PENDING"
  | "USED"
  | "EXPIRED"
  | "INVALIDATED";

export type OTPPurpose =
  | "ACCOUNT_VERIFICATION"
  | "PASSWORD_RESET"
  | "EMAIL_CHANGE";

export interface IOTPVerification {
  userId: string;
  email: string;
  otpHash: string;
  purpose: OTPPurpose;
  status: OTPStatus;
  expiresAt: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Identifier bundle a challenge consumer needs to verify or resend. */
export interface IOtpChallenge {
  userId: string;
  email: string;
  /** Raw code for dev only; remove once email delivery lands. */
  otp: string;
}

export interface IVerifyOTPRequest {
  userId: string;
  email: string;
  otp: string;
  purpose: OTPPurpose;
}

export interface IResendOTPRequest {
  userId: string;
  email: string;
  purpose: OTPPurpose;
}

export interface IResendOTPResponse {
  message: string;
  /** Raw code for dev only; remove once email delivery lands. */
  otp?: string;
}
