"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {SignupForm} from "@/features/auth/components/signup-form";
import {registerService} from "@/features/auth/services/authService";
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from "@/features/auth/utils/validators";

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
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setError("");
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!validatePassword(formData.rawPassword)) {
      setError(
        "Password must be at least 8 characters long and contain an uppercase letter and a special character.",
      );
      return;
    }

    if (!validatePhone(formData.phoneNumber)) {
      setError("Invalid phone number.");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Invalid email.");
      return;
    }

    if (!validateName(formData.firstName) || !validateName(formData.lastName)) {
      setError("Invalid name. Name can not contain a number or symbol");
      return;
    }

    if (formData.rawPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerService({formData, router, setError});
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <SignupForm
          formData={formData}
          error={error}
          isLoading={isSubmitting}
          onFormChange={handleChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
