"use client";
import {AuthRequiredDialog} from "@/features/auth/components/auth-modal";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {UserHeader} from "@/features/user-dashboard/components/UserHeader";
import {useRouter} from "next/navigation";
import React, {useEffect} from "react";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {user, isLoading} = useAuth();
  const router = useRouter();

  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAdmin) {
      router.replace("/admin/dashboard");
    } else if (isStaff) {
      router.replace("/admin/orders");
    }
  }, [isLoading, isAdmin, isStaff, router]);

  if (user?.role === "user" || !user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <UserHeader />
        <main className="min-w-0 w-full flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
            {children}
          </div>
        </main>
        <AuthRequiredDialog></AuthRequiredDialog>
      </div>
    );
  }
}
