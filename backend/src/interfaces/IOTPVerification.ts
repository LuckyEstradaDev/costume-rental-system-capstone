
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
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
