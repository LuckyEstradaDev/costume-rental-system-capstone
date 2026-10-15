"use client";

import {UserCircle2} from "lucide-react";

import {
  AdminPageHeader,
  AdminPageTitle,
} from "@/features/admin-dashboard/components/AdminPageHeader";
import {EditProfileForm} from "@/features/profile/components/EditProfileForm";

export default function EditProfilePage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={<AdminPageTitle icon={UserCircle2}>Edit profile</AdminPageTitle>}
        description="Update your account details."
      />
      <EditProfileForm redirectTo="/admin/profile" withHeading={false} />
    </div>
  );
}
