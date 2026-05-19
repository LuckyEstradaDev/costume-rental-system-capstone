import {UserSidebar} from "@/features/user-dashboard/sidebar/UserSidebar";
import React from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-background">
      <UserSidebar />
      <main className="min-w-0 flex-1 overflow-x-auto w-full p-4 pt-16 transition-[margin,padding] duration-300 md:ml-[var(--user-sidebar-width,18rem)] md:p-6">
        {children}
      </main>
    </div>
  );
}
