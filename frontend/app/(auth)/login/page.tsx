"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {sessionAuthenticationService} from "@/features/auth/services/authServices";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {LoginForm} from "@/components/login-form";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const {setAuthenticated, setUser} = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          credentials: "include",
          body: JSON.stringify({email, rawPassword: password}),
        },
      );

      if (res.ok) {
        try {
          const {data} = await sessionAuthenticationService();
          setAuthenticated(true);
          setUser(data.user);
        } catch (authError) {
          console.error("Failed to refresh auth state:", authError);
          // Optionally handle this (e.g., show an error or retry)
        }
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.message);
      }
    } catch (err) {
      setError("Login failed");
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  );
}
