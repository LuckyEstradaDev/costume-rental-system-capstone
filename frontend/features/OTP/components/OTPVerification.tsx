"use client";

import {useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {cn} from "@/lib/utils";
import {serverErrorMessage} from "@/features/auth/services/authService";
import {resendOTPService, verifyOTPService} from "../services/otpService";
import type {OTPPurpose} from "../types/IOTPVerification";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export type OTPVerificationProps = {
  email: string;
  purpose: OTPPurpose;
  onVerified: () => void | Promise<void>;
  title?: string;
  description?: string;
  className?: string;
} & (
  | {userId: string; verifyCode?: never; resendCode?: never}
  | {userId?: never; verifyCode: (code: string) => Promise<void>; resendCode: () => Promise<void>}
);

const emptyCode = () => Array<string>(CODE_LENGTH).fill("");

const formatCooldown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
};

export function OTPVerification({
  userId = "",
  email,
  purpose,
  onVerified,
  title = "Verify your email",
  description,
  className,
  verifyCode,
  resendCode,
}: OTPVerificationProps) {
  const [code, setCode] = useState<string[]>(emptyCode);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const requestInFlight = useRef(false);
  const restoreFocus = useRef(false);

  useEffect(() => {
    if (!isVerifying && !isResending && restoreFocus.current) {
      restoreFocus.current = false;
      inputRefs.current[0]?.focus();
      inputRefs.current[0]?.select();
    }
  }, [isVerifying, isResending]);

  // A code was just issued when this mounts, so the cooldown starts now.
  useEffect(() => {
    if (cooldown === 0) return;
    const timer = window.setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const focusSlot = (index: number) => {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  };

  const setSlot = (index: number, value: string) => {
    if (requestInFlight.current) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    if (next.every((digit) => /^\d$/.test(digit))) void verifyFilledCode(next);
  };

  const applyCode = (digits: string) => {
    if (requestInFlight.current) return;
    const filled = emptyCode();
    for (let i = 0; i < CODE_LENGTH; i++) {
      filled[i] = digits[i] ?? "";
    }
    setCode(filled);
    focusSlot(Math.max(0, Math.min(digits.length, CODE_LENGTH) - 1));
    if (filled.every((digit) => /^\d$/.test(digit))) void verifyFilledCode(filled);
  };

  const handleSlotChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length > 1) {
      applyCode(digits);
      return;
    }
    setSlot(index, digits);
    if (digits !== "" && index < CODE_LENGTH - 1) {
      focusSlot(index + 1);
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && code[index] === "" && index > 0) {
      event.preventDefault();
      setSlot(index - 1, "");
      focusSlot(index - 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const digits = event.clipboardData.getData("text").replace(/\D/g, "");
    if (digits !== "") applyCode(digits);
  };

  async function verifyFilledCode(slots: string[]) {
    if (requestInFlight.current) return;
    if (!slots.every((digit) => /^\d$/.test(digit))) {
      setError("Enter the 6-digit code.");
      focusSlot(Math.max(0, slots.findIndex((digit) => digit === "")));
      return;
    }

    requestInFlight.current = true;
    setError("");
    setIsVerifying(true);
    try {
      if (verifyCode) await verifyCode(slots.join(""));
      else await verifyOTPService({userId, email, otp: slots.join(""), purpose});
      await onVerified();
    } catch (err) {
      setError(serverErrorMessage(err));
      setCode(emptyCode());
      restoreFocus.current = true;
    } finally {
      requestInFlight.current = false;
      setIsVerifying(false);
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void verifyFilledCode(code);
  };

  const handleResend = async () => {
    if (cooldown > 0 || requestInFlight.current) return;

    requestInFlight.current = true;
    setError("");
    setIsResending(true);
    try {
      if (resendCode) await resendCode();
      else await resendOTPService({userId, email, purpose});
      setCode(emptyCode());
      setCooldown(RESEND_COOLDOWN_SECONDS);
      restoreFocus.current = true;
    } catch (err) {
      setError(serverErrorMessage(err));
    } finally {
      requestInFlight.current = false;
      setIsResending(false);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          {description ?? `Enter the 6-digit code sent to ${email}.`}
        </p>
      </div>

      <FieldGroup>
        <Field data-invalid={error !== ""}>
          <FieldLabel htmlFor="otp-code">Verification code</FieldLabel>
          <div className="flex gap-2" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                id={index === 0 ? "otp-code" : undefined}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus={index === 0}
                maxLength={CODE_LENGTH}
                value={digit}
                disabled={isVerifying || isResending}
                onChange={(event) => handleSlotChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
                aria-invalid={error !== ""}
                className="h-12 text-center text-lg font-semibold tabular-nums"
              />
            ))}
          </div>
          <FieldError>{error}</FieldError>
        </Field>

        <Field>
          <Button type="submit" className="h-10 w-full" loading={isVerifying} disabled={isResending}>
            {isVerifying ? "Verifying…" : purpose === "PASSWORD_RESET" ? "Verify code" : "Verify Account"}
          </Button>
        </Field>

        <Field>
          {cooldown > 0 ? (
            <p className="text-center text-base text-muted-foreground leading-relaxed">
              Resend code in {formatCooldown(cooldown)}
            </p>
          ) : (
            <Button
              type="button"
              variant="link"
              className="h-10 w-full"
              loading={isResending}
              disabled={isVerifying}
              onClick={handleResend}
            >
              {isResending ? "Sending…" : "Resend code"}
            </Button>
          )}
        </Field>
      </FieldGroup>
    </form>
  );
}
