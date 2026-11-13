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

export interface OTPVerificationProps {
  userId: string;
  email: string;
  purpose: OTPPurpose;
  onVerified: () => void | Promise<void>;
  title?: string;
  description?: string;
  className?: string;
}

const emptyCode = () => Array<string>(CODE_LENGTH).fill("");

const formatCooldown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
};

export function OTPVerification({
  userId,
  email,
  purpose,
  onVerified,
  title = "Verify your email",
  description,
  className,
}: OTPVerificationProps) {
  const [code, setCode] = useState<string[]>(emptyCode);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

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
    setCode((slots) => {
      const next = [...slots];
      next[index] = value;
      return next;
    });
  };

  const applyCode = (digits: string) => {
    const filled = emptyCode();
    for (let i = 0; i < CODE_LENGTH; i++) {
      filled[i] = digits[i] ?? "";
    }
    setCode(filled);
    focusSlot(Math.min(digits.length, CODE_LENGTH) - 1);
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.some((digit) => digit === "")) {
      setError("Enter the 6-digit code.");
      return;
    }

    setError("");
    setIsVerifying(true);
    try {
      await verifyOTPService({userId, email, otp: code.join(""), purpose});
      await onVerified();
    } catch (err) {
      setError(serverErrorMessage(err));
      setCode(emptyCode());
      focusSlot(0);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    setError("");
    setIsResending(true);
    try {
      await resendOTPService({userId, email, purpose});
      setCode(emptyCode());
      setCooldown(RESEND_COOLDOWN_SECONDS);
      focusSlot(0);
    } catch (err) {
      setError(serverErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">
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
                maxLength={1}
                value={digit}
                disabled={isVerifying}
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
          <Button type="submit" className="h-10 w-full" loading={isVerifying}>
            {isVerifying ? "Verifying…" : "Verify Account"}
          </Button>
        </Field>

        <Field>
          {cooldown > 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Resend code in {formatCooldown(cooldown)}
            </p>
          ) : (
            <Button
              type="button"
              variant="link"
              className="h-10 w-full"
              loading={isResending}
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
