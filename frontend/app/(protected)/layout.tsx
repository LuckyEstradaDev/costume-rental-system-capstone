"use client";
import {useEffect, useState} from "react";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {usePathname, useRouter} from "next/navigation";
import React from "react";
import Loading from "@/features/reusable/loading";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {isAuthenticated, isLoading} = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated && pathname == "/dashboard/browse") {
      return;
    }
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return <Loading label="Loading"></Loading>;
  }

  return <>{children}</>;
}
