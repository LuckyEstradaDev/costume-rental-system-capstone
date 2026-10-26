"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/features/auth/hooks/useAuth";
import Loading from "@/features/reusable/loading";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {user, isAuthenticated, isLoading} = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return;
    }

    if (user?.role === "admin") {
      router.replace("/admin/dashboard");
    } else if (user?.role === "staff") {
      router.replace("/admin/orders");
    } else if (user?.role === "user") {
      router.replace("/dashboard/browse");
    }
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading || isAuthenticated) {
    return <Loading label="Loading" />;
  }

  return children;
}
