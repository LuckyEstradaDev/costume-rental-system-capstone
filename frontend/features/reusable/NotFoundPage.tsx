"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {ArrowLeft, SearchX} from "lucide-react";

import {Button} from "@/components/ui/button";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {AdminHeader} from "@/features/admin-dashboard/components/AdminHeader";
import {AdminHeaderSlotsProvider} from "@/features/admin-dashboard/components/AdminHeaderSlots";
import {AdminSidebar} from "@/features/admin-dashboard/sidebar/AdminSidebar";
import Header from "@/features/landing-page/components/Header";
import {UserHeader} from "@/features/user-dashboard/components/UserHeader";

export default function NotFoundPage() {
  const {isAuthenticated, isLoading, user} = useAuth();
  const [isAdminNavOpen, setIsAdminNavOpen] = useState(false);
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    const homePath =
      user?.role === "admin"
        ? "/admin/dashboard"
        : user?.role === "staff"
          ? "/admin/orders"
          : isAuthenticated
            ? "/dashboard/browse"
            : "/";
    router.push(homePath);
  };

  const content = (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col items-center justify-center gap-5 px-4 py-10 text-center md:px-6">
      <div className="flex flex-col items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-xl bg-muted text-primary">
          <SearchX className="size-7" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            This route doesn&apos;t exist.
          </h1>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            The page may have moved, or the address may be incorrect.
          </p>
        </div>
      </div>
      <Button variant="outline" onClick={goBack}>
        <ArrowLeft aria-hidden />
        Go back
      </Button>
    </div>
  );

  if (user?.role === "admin" || user?.role === "staff") {
    return (
      <AdminHeaderSlotsProvider>
        <div className="flex min-h-screen bg-background">
          <AdminSidebar
            isMobileOpen={isAdminNavOpen}
            onCloseMobile={() => setIsAdminNavOpen(false)}
          />
          <div className="flex min-w-0 flex-1 flex-col md:ml-72">
            <AdminHeader onOpenNav={() => setIsAdminNavOpen(true)} />
            <main className="flex min-h-0 min-w-0 flex-1">{content}</main>
          </div>
        </div>
      </AdminHeaderSlotsProvider>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {!isLoading && isAuthenticated && user ? (
        <UserHeader />
      ) : !isLoading ? (
        <Header />
      ) : null}
      <main className="flex min-h-0 min-w-0 w-full flex-1">{content}</main>
    </div>
  );
}
