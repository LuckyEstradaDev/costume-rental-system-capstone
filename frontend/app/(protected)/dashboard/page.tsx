"use client";

import {useRouter} from "next/navigation";
import {UserSidebar} from "@/features/user-dashboard/sidebar/UserSidebar";

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
    <>
      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">You are logged in.</p>
        <button
          onClick={handleSignOut}
          className="mt-6 rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    </>
  );
}
