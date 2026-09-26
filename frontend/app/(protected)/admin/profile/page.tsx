"use client";

import {ProfileView} from "@/features/profile/components/ProfileView";
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
    />
  );
}
