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
      accountType="Customer"
      nameFallback="Customer Name"
      subtitle=""
      editHref="/dashboard/profile/edit"
      customerLayout
      animate
    />
  );
}
