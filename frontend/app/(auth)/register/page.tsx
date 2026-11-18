"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import coloredLogo from "@/assets/business-logo/Colored-logo.png";
import {SignupForm} from "@/features/auth/components/signup-form";
import {registerService, sessionAuthenticationService} from "@/features/auth/services/authService";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {validateRegisterForm, sanitizeNameInput} from "@/features/auth/utils/validators";
import {OTPVerification} from "@/features/OTP/components/OTPVerification";
import type {IOtpChallenge} from "@/features/OTP/types/IOTPVerification";

/** Pause before live field errors appear, so typing is not interrupted. */
const VALIDATION_DEBOUNCE_MS = 400;

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    rawPassword: "",
    confirmPassword: "",
    role: "user",
    phoneNumber: "",
    gender: "",
    dateOfBirth: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [challenge, setChallenge] = useState<IOtpChallenge | null>(null);
  const router = useRouter();
  const {setAuthenticated, setUser} = useAuth();

  // Debounced copy of the form: live regex errors only land once typing
  // pauses, so a half-typed email or password is not flagged mid-keystroke.
  const [debouncedFormData, setDebouncedFormData] = useState(formData);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedFormData(formData),
      VALIDATION_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [formData]);

  const fieldErrors = validateRegisterForm(debouncedFormData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setError("");
    const {name, value} = e.target;
    const isNameField = name === "firstName" || name === "lastName";
    setFormData({
      ...formData,
      [name]: isNameField ? sanitizeNameInput(value) : value,
    });
  };

  const handlePhoneChange = (value: string) => {
    setError("");
    setFormData({...formData, phoneNumber: value});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Judged against what is typed right now, not the debounced copy; the
    // flush also surfaces the field highlights in the same paint.
    setDebouncedFormData(formData);
    if (!acceptedTerms) {
      setError(
        "Please agree to the Terms and Conditions and Privacy Policy to continue.",
      );
      return;
    }
    if (Object.keys(validateRegisterForm(formData)).length > 0) {
      setError("Please fix the highlighted fields before continuing.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Stays on this route: verification happens in the OTP step below.
      const createdChallenge = await registerService({formData, setError});
      if (createdChallenge) setChallenge(createdChallenge);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verification succeeded and the backend set the session cookie: adopt it
  // and enter the app. If the session cannot be read, the account is still
  // verified, so the login page is the natural fallback.
  const handleVerified = async () => {
    try {
      const {data} = await sessionAuthenticationService();
      setAuthenticated(true);
      setUser(data.user);
      router.push("/dashboard/browse");
    } catch (err) {
      console.error("Failed to refresh auth state:", err);
      router.push("/login");
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-lg">
        {challenge ? (
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2" aria-label="Morena home">
              <Image
                src={coloredLogo}
                alt="Morena"
                priority
                className="h-10 w-auto"
              />
            </Link>
            <OTPVerification
              userId={challenge.userId}
              email={challenge.email}
              purpose="ACCOUNT_VERIFICATION"
              onVerified={handleVerified}
            />
          </div>
        ) : (
          <SignupForm
            formData={formData}
            error={error}
            fieldErrors={fieldErrors}
            isLoading={isSubmitting}
            acceptedTerms={acceptedTerms}
            onAcceptedTermsChange={setAcceptedTerms}
            onFormChange={handleChange}
            onPhoneChange={handlePhoneChange}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
