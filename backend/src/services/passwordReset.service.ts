import {createHash, randomBytes, randomInt} from "node:crypto";
import bcrypt from "bcrypt";
import {AuthRepository} from "../repositories/AuthRepository.js";
import {HTTPError} from "../utils/HttpError.js";
import {OTP_EXPIRY_MS} from "../config/otp.js";
import {sendOTPEmail} from "./email.service.js";

const repository = new AuthRepository();
const sentMessage = "If an account exists for this email, a reset code has been sent.";

function normalizeEmail(email: unknown): string {
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new HTTPError("Enter a valid email address.", 400);
  }
  return email.trim().toLowerCase();
}

export async function requestPasswordReset(email: unknown) {
  const address = normalizeEmail(email);
  const code = randomInt(100000, 1000000).toString();
  const hash = await bcrypt.hash(code, 10);
  const user = await repository.findByEmail(address);
  if (user) {
    const challenge = await repository.issuePasswordReset(user._id.toString(), hash, new Date(Date.now() + OTP_EXPIRY_MS));
    if (challenge) {
      try {
        await sendOTPEmail({to: user.email, otp: code, name: user.firstName, purpose: "PASSWORD_RESET"});
      } catch {
        console.error("Password reset email delivery failed.");
      }
    }
  }
  return {message: sentMessage};
}

export async function verifyResetCode(email: unknown, otp: unknown) {
  const address = normalizeEmail(email);
  if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
    throw new HTTPError("Enter the 6-digit reset code.", 400);
  }
  const user = await repository.reserveResetAttempt(address);
  const challenge = user?.passwordReset;
  const invalidCode = () => new HTTPError("The reset code is invalid or expired. Request a new code.", 400);
  if (!user || !challenge || !await bcrypt.compare(otp, challenge.hash)) throw invalidCode();
  const resetToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(resetToken).digest("hex");
  const verified = await repository.verifyPasswordReset(user._id.toString(), challenge.hash, tokenHash);
  if (!verified) throw invalidCode();
  return {resetToken};
}

export async function resetPassword(email: unknown, resetToken: unknown, password: unknown, confirmation: unknown) {
  const address = normalizeEmail(email);
  if (typeof resetToken !== "string" || !/^[a-f0-9]{64}$/.test(resetToken)) {
    throw new HTTPError("Verify your reset code before changing your password.", 400);
  }
  if (typeof password !== "string" || password.length < 8 || Buffer.byteLength(password, "utf8") > 72 ||
    !/[A-Z]/.test(password) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    throw new HTTPError("Use 8 or more characters with an uppercase letter and a symbol (maximum 72 bytes).", 400);
  }
  if (password !== confirmation) throw new HTTPError("Passwords do not match.", 400);
  const hashedPassword = await bcrypt.hash(password, 10);
  const tokenHash = createHash("sha256").update(resetToken).digest("hex");
  const updated = await repository.completePasswordReset(address, tokenHash, hashedPassword);
  if (!updated) throw new HTTPError("Your reset session is invalid or expired. Request a new code.", 400);
  return {message: "Password reset successfully. Sign in with your new password."};
}
