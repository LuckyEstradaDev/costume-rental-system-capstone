"use client";
import {AuthRequiredDialog} from "@/features/auth/components/auth-modal";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {UserHeader} from "@/features/user-dashboard/components/UserHeader";
import {MotionProvider} from "@/components/motion";
import {usePathname, useRouter} from "next/navigation";
import React, {useEffect} from "react";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {user, isLoading} = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
      <MotionProvider>
        <div className="flex min-h-screen flex-col bg-background ">
          {pathname === "/dashboard/browse" ? (
            <div className="sticky top-0 z-30 bg-background">
              <UserHeader />
              <div className="bg-primary text-primary-foreground">
                <p className="mx-auto w-full max-w-7xl px-4 py-3 text-wrap text-sm leading-relaxed md:px-6">
                  Find your fit with AR.
                  Try on an outfit virtually to check the fit before you rent or buy.
                </p>
              </div>
            </div>
          ) : (
            <UserHeader />
          )}
          <main className="min-w-0 w-full flex-1">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
              {children}
            </div>
          </main>
          <AuthRequiredDialog></AuthRequiredDialog>
        </div>
      </MotionProvider>
    );
  }
}
