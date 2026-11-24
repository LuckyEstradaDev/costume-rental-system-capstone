"use client";

import Link from "next/link";
import {motion} from "framer-motion";
import {
  CalendarDays,
  Mail,
  MapPin,
  PencilIcon,
  Phone,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type {ReactNode} from "react";

import {UserAvatar} from "@/components/UserAvatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {fadeInUp, staggerContainer, staggerItem} from "@/components/motion";
import {formatReadableDate} from "@/lib/formatters";
import {formatAddress} from "@/features/address/utils/formatAddress";
import type {IUser} from "@/features/auth/types/IUser";

const fallbackText = "Not provided";

export type ProfileViewProps = {
  user: IUser | null;
  isLoading: boolean;
  accountLabel: string;
  accountType: string;
  nameFallback: string;
  subtitle: string;
  editHref?: string;
  customerLayout?: boolean;
  /**
   * Replaces the built-in title block. The admin section passes the shared
   * sticky `AdminPageHeader` here so it lines up with every other admin tab.
   */
  header?: ReactNode;
  /**
   * Plays the entrance animation. Opt-in so the admin profile, which shares
   * this component, is left untouched.
   */
  animate?: boolean;
};

export function ProfileView({
  user,
  isLoading,
  accountLabel,
  accountType,
  nameFallback,
  subtitle,
  editHref,
  customerLayout = false,
  header,
  animate = false,
}: ProfileViewProps) {
  if (isLoading) {
    return customerLayout ? (
      <Card
        className={customerCard}
        role="status"
        aria-label="Loading profile"
      >
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 shrink-0 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-40 max-w-full" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
        {[0, 1].map((index) => (
          <div key={index} className="space-y-4">
            <Skeleton className="h-6 w-44 max-w-full" />
            {[0, 1, 2].map((field) => (
              <div key={field} className={customerRow}>
                <div className="flex items-center gap-2.5">
                  <Skeleton className="size-5 shrink-0" />
                  <Skeleton className="h-5 w-20 max-w-full" />
                </div>
                <Skeleton className="ml-auto h-5 w-36 max-w-full" />
              </div>
            ))}
          </div>
        ))}
      </Card>
    ) : (
      <ProfileSkeleton />
    );
  }

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  const rows = [
    {label: "First name", value: user?.firstName, icon: UserRound},
    {label: "Last name", value: user?.lastName, icon: UserRound},
    {label: "Gender", value: formatValue(user?.gender), icon: UserRound},
    {label: "Phone number", value: user?.phoneNumber, icon: Phone},
    {label: "Email", value: user?.email, icon: Mail},
    {label: "Address", value: formatAddress(user?.address), icon: MapPin},
    {label: "Account type", value: accountType, icon: ShieldCheck},
    {
      label: "Member since",
      value: user?.createdAt ? formatReadableDate(user.createdAt) : undefined,
      icon: CalendarDays,
    },
  ];

  if (customerLayout) {
    return (
      <motion.div
        variants={staggerContainer}
        initial={animate ? "hidden" : false}
        animate="visible"
      >
        <Card className={customerCard}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold text-primary md:text-3xl">
              My profile
            </h1>
            {editHref && (
              <Button asChild>
                <Link href={editHref}>
                  <PencilIcon aria-hidden="true" /> Edit profile
                </Link>
              </Button>
            )}
          </div>
          <motion.section
            variants={fadeInUp}
            className="flex flex-wrap items-center gap-4 text-primary"
          >
            <UserAvatar
              size="lg"
              src={user?.profilePicture}
              firstName={user?.firstName}
              lastName={user?.lastName}
              alt={fullName || nameFallback}
            />
            <div className="min-w-0 space-y-1">
              <h2 className="break-words text-2xl font-semibold">
                {fullName || nameFallback}
              </h2>
              <p className="text-base text-muted-foreground">
                {accountLabel}
              </p>
              {user?.createdAt && (
                <p className="text-base text-muted-foreground">
                  Member since {formatReadableDate(user.createdAt)}
                </p>
              )}
            </div>
          </motion.section>
          <CustomerProfileSection
            title="Personal information"
            rows={rows.slice(0, 3)}
          />
          <CustomerProfileSection
            title="Contact information"
            rows={rows.slice(3, 6)}
          />
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial={animate ? "hidden" : false}
      animate="visible"
      className="min-w-0 space-y-6"
    >
      {header ?? (
        <motion.div variants={fadeInUp} className="pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            My Profile
          </h1>
          <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">{subtitle}</p>
        </motion.div>
      )}

      <motion.div variants={fadeInUp}>
        <Card className="p-5 sm:p-6">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-5 sm:text-left">
            <UserAvatar
              size="lg"
              src={user?.profilePicture}
              firstName={user?.firstName}
              lastName={user?.lastName}
              alt={fullName || nameFallback}
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
      </motion.div>

      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>
              These details are used for your orders and rentals.
            </CardDescription>
            {editHref ? (
              <CardAction>
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link href={editHref}>
                    <PencilIcon className="size-3.5" />
                    Edit
                  </Link>
                </Button>
              </CardAction>
            ) : null}
          </CardHeader>

          <CardContent>
            <motion.dl
              variants={staggerContainer}
              className="divide-y divide-border/60"
            >
              {rows.map((row) => (
                <motion.div
                  key={row.label}
                  variants={staggerItem}
                  className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <dt className="text-sm text-muted-foreground">{row.label}</dt>
                  <dd className="min-w-0 break-words text-sm font-medium text-foreground sm:text-right">
                    {row.value || fallbackText}
                  </dd>
                </motion.div>
              ))}
            </motion.dl>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

const customerCard =
  "mx-auto w-full min-w-0 max-w-2xl gap-8 rounded-lg border border-border/50 bg-background p-5 ring-0 sm:p-8";
const customerRow =
  "grid min-w-0 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-baseline gap-3 sm:gap-6";

function CustomerProfileSection({
  title,
  rows,
}: {
  title: string;
  rows: {label: string; value?: string; icon: LucideIcon}[];
}) {
  return (
    <motion.section variants={fadeInUp} className="min-w-0 space-y-4">
      <h2 className="text-xl font-semibold text-primary md:text-2xl">{title}</h2>
      <dl className="space-y-4">
        {rows.map(({label, value, icon: Icon}) => (
          <div key={label} className={customerRow}>
            <dt className="flex min-w-0 items-start gap-2.5 text-base text-muted-foreground">
              <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <span className="break-words">{label}</span>
            </dt>
            <dd className="min-w-0 break-words text-right text-base font-medium text-secondary">
              {value || fallbackText}
            </dd>
          </div>
        ))}
      </dl>
    </motion.section>
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

function formatValue(value?: string) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}
