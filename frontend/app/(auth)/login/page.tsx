"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {cn} from "@/lib/utils";
import {loginService, sessionAuthenticationService} from "@/features/auth/services/authService";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {LoginForm} from "@/features/auth/components/login-form";
import {OTPVerification} from "@/features/OTP/components/OTPVerification";
import type {IOtpChallenge} from "@/features/OTP/types/IOTPVerification";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [challenge, setChallenge] = useState<IOtpChallenge | null>(null);
  const router = useRouter();
  const {setAuthenticated, setUser} = useAuth();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Accepted credentials come back as an OTP challenge instead of a
      // session; the OTP step below finishes the login on this route.
      const loginChallenge = await loginService({
        formData,
        setAuthenticated,
        setUser,
        router,
        setError,
      });
      if (loginChallenge) setChallenge(loginChallenge);
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP verified: the backend set the session cookie, so adopt it and enter
  // the app. If the session cannot be read, the account is verified already,
  // so the credentials form is the fallback.
  const handleVerified = async () => {
    try {
      const {data} = await sessionAuthenticationService();
      setAuthenticated(true);
      setUser(data.user);
      router.push("/dashboard/browse");
    } catch (err) {
      console.error("Failed to refresh auth state:", err);
      setChallenge(null);
      setError("Your account is verified. Please sign in.");
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div
        className={cn(
          "w-full",
          challenge ? "max-w-sm md:max-w-lg" : "max-w-sm md:max-w-4xl",
        )}
      >
        {challenge ? (
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2" aria-label="Morena home">
              <span className="size-6 rounded-full bg-primary" />
              <span className="text-lg font-bold text-primary">Morena</span>
            </Link>
            <OTPVerification
              userId={challenge.userId}
              email={challenge.email}
              purpose="ACCOUNT_VERIFICATION"
              title="Verify your account"
              onVerified={handleVerified}
            />
          </div>
        ) : (
          <LoginForm
            formData={formData}
            error={error}
            isLoading={isSubmitting}
            onFormChange={handleChange}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
