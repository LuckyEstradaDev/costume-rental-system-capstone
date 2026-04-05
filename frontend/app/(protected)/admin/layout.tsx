import {AdminSidebar} from "@/features/admin-dashboard/components/admin-sidebar";
import React from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-x-auto p-6">{children}</main>
    </div>
  );
}
