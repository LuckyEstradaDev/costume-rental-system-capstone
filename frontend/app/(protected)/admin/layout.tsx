"use client";

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

  if (isLoading || user?.role !== "admin") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-x-auto w-full p-6 md:ml-72">
        {children}
      </main>
    </div>
  );
}
