import {AdminSidebar} from "@/features/admin-dashboard/sidebar/AdminSidebar";
import React from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-x-auto w-full p-6 md:ml-72">
        {children}
      </main>
    </div>
  );
}
