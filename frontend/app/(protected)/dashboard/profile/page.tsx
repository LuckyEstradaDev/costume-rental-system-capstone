"use client";

import type {ComponentType} from "react";
import {
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  VenusAndMars,
} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {useAuth} from "@/features/auth/hooks/useAuth";

const fallbackText = "Not provided";

export default function ProfilePage() {
  const {user, isLoading} = useAuth();
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const initials = getInitials(user?.firstName, user?.lastName);

  if (isLoading) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        Loading profile...
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <UserCircle2 className="size-4.5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              My Profile
            </h1>
            <p className="text-sm text-muted-foreground">
              View your account details and customer information.
            </p>
          </div>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        <Card className="self-start">
          <CardHeader className="items-center text-center">
            <div className="grid size-24 place-items-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
              {initials || <UserCircle2 className="size-11" />}
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl">
                {fullName || "Customer Name"}
              </CardTitle>
              <CardDescription>{user?.email || fallbackText}</CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1.5">
              <ShieldCheck className="size-3.5" />
              Customer Account
            </Badge>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              These details are used for your orders and rentals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField
                icon={UserCircle2}
                label="First Name"
                value={user?.firstName}
              />
              <ProfileField
                icon={UserCircle2}
                label="Last Name"
                value={user?.lastName}
              />
              <ProfileField icon={Mail} label="Email" value={user?.email} />
              <ProfileField
                icon={Phone}
                label="Phone Number"
                value={user?.phoneNumber}
              />
              <ProfileField
                icon={VenusAndMars}
                label="Gender"
                value={formatValue(user?.gender)}
              />
              <ProfileField
                icon={Sparkles}
                label="Account Type"
                value="Costume rental customer"
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

type ProfileFieldProps = {
  icon: ComponentType<{className?: string}>;
  label: string;
  value?: string;
};

function ProfileField({icon: Icon, label, value}: ProfileFieldProps) {
  return (
    <div className="rounded-lg border bg-background px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-2 min-h-6 break-words text-base font-medium">
        {value || fallbackText}
      </p>
    </div>
  );
}

function getInitials(firstName?: string, lastName?: string) {
  return [firstName, lastName]
    .filter(Boolean)
    .map((name) => name?.[0])
    .join("")
    .toUpperCase();
}

function formatValue(value?: string) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}
