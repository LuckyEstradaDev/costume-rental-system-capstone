"use client";

import {ProfileView} from "@/features/profile/components/ProfileView";
import {
  AdminPageHeader,
  AdminPageTitle,
} from "@/features/admin-dashboard/components/AdminPageHeader";
import {UserCircle2} from "lucide-react";
import {useAuth} from "@/features/auth/hooks/useAuth";

export default function ProfilePage() {
  const {user, isLoading} = useAuth();

  return (
    <ProfileView
      user={user}
      isLoading={isLoading}
      accountLabel="Admin Account"
      accountType="Admin"
      nameFallback="Admin Name"
      subtitle="View your account details and admin information."
      header={
        <AdminPageHeader
          title={<AdminPageTitle icon={UserCircle2}>My profile</AdminPageTitle>}
          description="Your account details and sign-in security."
        />
      }
    />
  );
}
