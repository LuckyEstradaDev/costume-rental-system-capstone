"use client";

import {ProfileView} from "@/features/profile/components/ProfileView";
import {useAuth} from "@/features/auth/hooks/useAuth";

export default function ProfilePage() {
  const {user, isLoading} = useAuth();

  return (
    <ProfileView
      user={user}
      isLoading={isLoading}
      accountLabel="Customer Account"
      accountType="Costume rental customer"
      nameFallback="Customer Name"
      subtitle="View your account details and customer information."
    />
  );
}
