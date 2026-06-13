"use client";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {UserSidebar} from "@/features/user-dashboard/sidebar/UserSidebar";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {user} = useAuth();
  const router = useRouter();
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    if (user?.role == "admin" || user?.role == "superadmin") {
      router.replace("/admin/dashboard");
    }
    setLoading(false);
  }, [user]);

  if (isLoading || user?.role !== "user") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <UserSidebar />
      <main className="min-w-0 flex-1 overflow-x-auto w-full p-4 pt-16 transition-[margin,padding] duration-300 md:ml-[var(--user-sidebar-width,18rem)] md:p-6">
        {children}
      </main>
    </div>
  );
}
