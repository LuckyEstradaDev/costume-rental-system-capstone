"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {AdminSidebar} from "@/features/admin-dashboard/components/admin-sidebar";

export default function Dashboard() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      // ignore
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Welcome to your Dashboard!
            </h2>
            <p className="text-gray-600">You are logged in.</p>
            {/* Add more dashboard content here */}
            <p className="mt-4 text-gray-500">
              This is a simple dashboard. Add more features as needed.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
