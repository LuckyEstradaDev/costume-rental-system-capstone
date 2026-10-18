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
  const role = user?.role;
  const isStaff = role === "staff";
  const accountType = isStaff ? "Staff" : "Admin";
  const accountLabel = isStaff ? "Staff Account" : "Admin Account";
  const nameFallback = isStaff ? "Staff Name" : "Admin Name";

  return (
    <ProfileView
      user={user}
      isLoading={isLoading}
      accountLabel={accountLabel}
      accountType={accountType}
      nameFallback={nameFallback}
      subtitle="View your account details and admin information."
      editHref="/admin/profile/edit"
      header={
        <AdminPageHeader
          title={<AdminPageTitle icon={UserCircle2}>My profile</AdminPageTitle>}
          description="Your account details and sign-in security."
        />
      }
    />
  );
}
