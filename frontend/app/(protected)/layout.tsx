"use client";
import {useEffect, useState} from "react";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {useRouter} from "next/navigation";
import React from "react";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {isAuthenticated, isLoading} = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setIsRedirecting(true);
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || isRedirecting) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
