"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {loginService} from "@/features/auth/services/authService";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {LoginForm} from "@/features/auth/components/login-form";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();
  const {setAuthenticated, setUser} = useAuth();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    await loginService({
      formData,
      setAuthenticated,
      setUser,
      router,
      setError,
    });
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm
          formData={formData}
          error={error}
          onFormChange={handleChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
