"use client";

import {ShieldCheck, UserCircle2} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {formatReadableDate} from "@/lib/formatters";
import type {IUser} from "@/features/auth/types/IUser";

const fallbackText = "Not provided";

export type ProfileViewProps = {
  user: IUser | null;
  isLoading: boolean;
  accountLabel: string;
  accountType: string;
  nameFallback: string;
  subtitle: string;
};

export function ProfileView({
  user,
  isLoading,
  accountLabel,
  accountType,
  nameFallback,
  subtitle,
}: ProfileViewProps) {
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const initials = getInitials(user?.firstName, user?.lastName);

  const rows = [
    {label: "First name", value: user?.firstName},
    {label: "Last name", value: user?.lastName},
    {label: "Gender", value: formatValue(user?.gender)},
    {label: "Phone number", value: user?.phoneNumber},
    {label: "Email", value: user?.email},
    {label: "Account type", value: accountType},
    {
      label: "Member since",
      value: user?.createdAt ? formatReadableDate(user.createdAt) : undefined,
    },
  ];

  return (
    <div className="min-w-0 space-y-6">
      <div className="pb-2">
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
          <UserCircle2 className="size-6 text-foreground" />
          My Profile
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-5 sm:text-left">
          <Avatar
            initials={initials}
            fullName={fullName || nameFallback}
            profilePicture={user?.profilePicture}
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="min-w-0 break-words text-2xl font-bold tracking-tight text-foreground">
                {fullName || nameFallback}
              </h2>
              <Badge variant="secondary" className="gap-1.5">
                <ShieldCheck className="size-3.5" />
                {accountLabel}
              </Badge>
            </div>

            <p className="mt-1 break-words text-sm text-muted-foreground">
              {user?.email || fallbackText}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>
            These details are used for your orders and rentals.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <dl className="divide-y divide-border/60">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <dt className="text-sm text-muted-foreground">{row.label}</dt>
                <dd className="min-w-0 break-words text-sm font-medium text-foreground sm:text-right">
                  {row.value || fallbackText}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-w-0 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
          <Skeleton className="size-24 shrink-0 rounded-full" />
          <div className="w-full space-y-2.5">
            <Skeleton className="mx-auto h-7 w-48 sm:mx-0" />
            <Skeleton className="mx-auto h-4 w-64 sm:mx-0" />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/60">
            {Array.from({length: 7}).map((_, index) => (
              <div
                key={index}
                className="flex flex-col gap-1.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type AvatarProps = {
  initials: string;
  fullName: string;
  profilePicture?: string;
};

function Avatar({initials, fullName, profilePicture}: AvatarProps) {
  return (
    <div className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-3xl font-bold text-primary-foreground ring-4 ring-background">
      <span className="grid place-items-center">
        {initials || <UserCircle2 className="size-11" />}
      </span>
      {profilePicture ? (
        <img
          src={profilePicture}
          alt={fullName}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
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
