"use client";
import {useEffect} from "react";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {usePathname, useRouter} from "next/navigation";
import React from "react";
import Loading from "@/features/reusable/loading";

function isPublicBrowsePath(pathname: string) {
  return (
    pathname === "/dashboard/browse" ||
    pathname.startsWith("/dashboard/browse/")
  );
}

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {isAuthenticated, isLoading} = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated && isPublicBrowsePath(pathname)) {
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
