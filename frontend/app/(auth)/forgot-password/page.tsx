"use client";

import {useRef, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import coloredLogo from "@/assets/business-logo/Colored-logo.png";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {
  requestPasswordReset,
  resetPassword,
  verifyResetCode,
} from "@/features/auth/services/passwordResetService";
import {OTPVerification} from "@/features/OTP/components/OTPVerification";
import {serverErrorMessage} from "@/features/auth/services/authService";
import {validatePassword} from "@/features/auth/utils/validators";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [stage, setStage] = useState<"email" | "verify" | "reset" | "done">(
    "email",
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  async function sendCode() {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      await requestPasswordReset(email.trim().toLowerCase());
      setStage("verify");
      setResetToken("");
    } catch (err) {
      setError(serverErrorMessage(err));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (stage === "email") return sendCode();
    if (inFlight.current) return;
    setError("");
    if (
      !validatePassword(password) ||
      new TextEncoder().encode(password).length > 72
    ) {
      setError(
        "Use 8 or more characters with an uppercase letter and a symbol (maximum 72 bytes).",
      );
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    inFlight.current = true;
    setBusy(true);
    try {
      await resetPassword({
        email: email.trim().toLowerCase(),
        resetToken,
        password,
        confirmPassword,
      });
      setPassword("");
      setConfirmPassword("");
      setResetToken("");
      setStage("done");
    } catch (err) {
      setError(serverErrorMessage(err));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm space-y-8">
        <Link href="/" aria-label="Morena home" className="inline-flex">
          <Image
            src={coloredLogo}
            alt="Morena"
            priority
            className="h-10 w-auto"
          />
        </Link>
        {stage === "done" ? (
          <div className="space-y-6" role="status">
            <h1 className="text-2xl font-bold text-primary">
              Password updated
            </h1>
            <p className="text-base text-secondary/80 leading-relaxed">
              Sign in with your new password.
            </p>
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Back to sign in
            </Link>
          </div>
        ) : stage === "verify" ? (
          <div className="space-y-6">
            <OTPVerification
              email={email.trim().toLowerCase()}
              purpose="PASSWORD_RESET"
              title="Verify your reset code"
              description={`If ${email.trim()} has an account, a six-digit code will arrive by email. It expires in 10 minutes.`}
              verifyCode={async (code) => {
                const token = await verifyResetCode(
                  email.trim().toLowerCase(),
                  code,
                );
                setResetToken(token);
              }}
              resendCode={() =>
                requestPasswordReset(email.trim().toLowerCase())
              }
              onVerified={() => setStage("reset")}
            />
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setStage("email");
                setError("");
              }}
            >
              Change email
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold text-primary">
                {stage === "email" ? "Forgot password?" : "Reset your password"}
              </h1>
              <p className="text-base text-secondary/80 leading-relaxed">
                {stage === "email"
                  ? "Enter your email to receive a reset code."
                  : "Your email is verified. Choose a new password."}
              </p>
            </div>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="reset-email">Email</FieldLabel>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  placeholder="johndoe@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={busy || stage === "reset"}
                />
              </Field>
              {stage === "reset" && (
                <>
                  <Field>
                    <FieldLabel htmlFor="new-password">New password</FieldLabel>
                    <Input
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      disabled={busy}
                    />
                    <p className="text-base text-secondary/80 leading-relaxed">
                      At least 8 characters, an uppercase letter and a symbol.
                    </p>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm password
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      required
                      disabled={busy}
                    />
                  </Field>
                </>
              )}
              {error && <FieldError role="alert">{error}</FieldError>}
              <Button type="submit" className="h-10 w-full" loading={busy}>
                {stage === "email" ? "Send reset code" : "Reset password"}
              </Button>
            </FieldGroup>
            <Link
              href="/login"
              className="inline-block text-sm text-secondary underline underline-offset-4"
            >
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
