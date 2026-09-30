"use client";

import {AdminHeader} from "@/features/admin-dashboard/components/AdminHeader";
import {AdminHeaderSlotsProvider} from "@/features/admin-dashboard/components/AdminHeaderSlots";
import {AdminSidebar} from "@/features/admin-dashboard/sidebar/AdminSidebar";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoading, setLoading] = useState(true);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const {user} = useAuth();
  const router = useRouter();
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    if (user?.role == "user") {
      router.replace("/dashboard/browse");
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(false);
  }, [user]);

  if (isLoading || (user?.role !== "admin" && user?.role !== "superadmin")) {
    return <div>Loading...</div>;
  }

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
