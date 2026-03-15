"use client";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {redirect} from "next/navigation";
import React from "react";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {isAuthenticated, isLoading} = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // or a spinner component
  }

  return isAuthenticated ? <>{children}</> : redirect("/login");
}
