"use client";
import {useEffect, useState} from "react";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {usePathname, useRouter} from "next/navigation";
import React from "react";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {isAuthenticated, isLoading, isAuthorized} = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated && pathname == "/dashboard/browse") {
      return;
    }
    if (!isLoading && !isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsRedirecting(true);
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || isRedirecting) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
