"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {SignupForm} from "@/features/auth/components/signup-form";
import {registerService} from "@/features/auth/services/authService";
import {validateRegisterForm} from "@/features/auth/utils/validators";

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
  const router = useRouter();

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
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Judged against what is typed right now, not the debounced copy; the
    // flush also surfaces the field highlights in the same paint.
    setDebouncedFormData(formData);
    if (Object.keys(validateRegisterForm(formData)).length > 0) {
      setError("Please fix the highlighted fields before continuing.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerService({
        formData,
        router,
        setError,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-lg">
        <SignupForm
          formData={formData}
          error={error}
          fieldErrors={fieldErrors}
          isLoading={isSubmitting}
          onFormChange={handleChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
