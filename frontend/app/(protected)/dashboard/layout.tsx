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
      <main className="min-w-0 flex-1 overflow-x-auto w-full p-6 ml-72">
        {children}
      </main>
    </div>
  );
}
