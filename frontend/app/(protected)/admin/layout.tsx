"use client";

import {AdminHeader} from "@/features/admin-dashboard/components/AdminHeader";
import {AdminHeaderSlotsProvider} from "@/features/admin-dashboard/components/AdminHeaderSlots";
import {canAccessAdminPath} from "@/features/admin-dashboard/permissions";
import {AdminSidebar} from "@/features/admin-dashboard/sidebar/AdminSidebar";
import {useAuth} from "@/features/auth/hooks/useAuth";
import Loading from "@/features/reusable/loading";
import {usePathname, useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const {user, isLoading} = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasAdminAccess = canAccessAdminPath(user?.role, pathname);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user || user.role === "user") {
      router.replace("/dashboard/browse");
      return;
    }

    if (!canAccessAdminPath(user.role, pathname)) {
      router.replace("/admin/orders");
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading || !user || user.role === "user" || !hasAdminAccess) {
    return <Loading label="Loading" />;
  }

  if (user.role === "admin" || user.role === "staff") {
    return (
      <AdminHeaderSlotsProvider>
        <div className="flex min-h-screen bg-background">
          <AdminSidebar
            isMobileOpen={isNavOpen}
            onCloseMobile={() => setIsNavOpen(false)}
          />

          {/* `md:ml-72` clears the fixed sidebar. The header is `sticky` inside
            this column, so it inherits the offset and needs none of its own.
            Neither the column nor `main` may gain `overflow-*`: that would make
            it the scrollport and the header would stop sticking, because the
            page's own scrolling is meant to be the viewport's. */}
          <div className="flex min-w-0 flex-1 flex-col md:ml-72">
            <AdminHeader onOpenNav={() => setIsNavOpen(true)} />
            <main className="min-w-0 flex-1 w-full p-6">{children}</main>
          </div>
        </div>
      </AdminHeaderSlotsProvider>
    );
  }
}
