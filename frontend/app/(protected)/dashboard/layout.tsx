"use client";
import {AuthRequiredDialog} from "@/features/auth/components/auth-modal";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {UserHeader} from "@/features/user-dashboard/components/UserHeader";
import {MotionProvider} from "@/components/motion";
import {usePathname, useRouter} from "next/navigation";
import {X} from "lucide-react";
import React, {useEffect, useState} from "react";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {user, isLoading} = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

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
              {!isBannerDismissed && (
                <div className="bg-primary text-primary-foreground">
                  <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
                    <p className="py-3 text-wrap text-sm leading-relaxed">
                      Find your fit with AR.
                      Try on an outfit virtually to check the fit before you rent or buy.
                    </p>
                    <button
                      type="button"
                      aria-label="Dismiss AR banner"
                      className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-primary-foreground/10 focus-visible:outline-2 focus-visible:outline-primary-foreground"
                      onClick={() => setIsBannerDismissed(true)}
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>
              )}
              <UserHeader />
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
