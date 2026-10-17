"use client";

import Link from "next/link";
import {Bell, CalendarClock, CheckCircle2, PackageCheck} from "lucide-react";
import type {LucideIcon} from "lucide-react";

import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * A placeholder notification tray for the customer header.
 *
 * This is intentionally separate from the transient toast system in
 * `components/ui/alert.tsx` (`useNotification` / `NotificationProvider`):
 * those are auto-dismissing popups, whereas this is a persistent list the user
 * opens from the bell. The data below is static sample content - wire it to a
 * real source later without touching the alert system.
 */
type HeaderNotification = {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
  unread?: boolean;
  href?: string;
};

const SAMPLE_NOTIFICATIONS: HeaderNotification[] = [
  {
    id: "sample-ready",
    title: "Order ready for pickup",
    description: "Your Barong Tagalog order is ready to be picked up.",
    time: "2 minutes ago",
    icon: PackageCheck,
    unread: true,
  },
  {
    id: "sample-payment",
    title: "Payment confirmed",
    description: "We received your payment for order #10248.",
    time: "1 hour ago",
    icon: CheckCircle2,
    unread: true,
  },
  {
    id: "sample-due",
    title: "Rental due soon",
    description: "Your Filipiniana gown rental is due in 2 days.",
    time: "Yesterday",
    icon: CalendarClock,
  },
];

export function NotificationDropdown() {
  const unreadCount = SAMPLE_NOTIFICATIONS.filter(
    (notification) => notification.unread,
  ).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          className="relative text-foreground"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between text-sm font-semibold text-foreground">
          <span>Notifications</span>
          <span className="text-xs font-normal text-muted-foreground">
            {unreadCount} unread
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {SAMPLE_NOTIFICATIONS.map((notification) => {
          const Icon = notification.icon;

          return (
            <DropdownMenuItem
              key={notification.id}
              asChild={Boolean(notification.href)}
              className="items-start gap-2.5 py-2"
            >
              {notification.href ? (
                <Link href={notification.href}>
                  <NotificationRow
                    notification={notification}
                    Icon={Icon}
                  />
                </Link>
              ) : (
                <NotificationRow notification={notification} Icon={Icon} />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationRow({
  notification,
  Icon,
}: {
  notification: HeaderNotification;
  Icon: LucideIcon;
}) {
  return (
    <>
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">
            {notification.title}
          </span>
          {notification.unread && (
            <span className="size-1.5 shrink-0 rounded-full bg-primary" />
          )}
        </span>
        <span className="line-clamp-2 text-xs text-muted-foreground">
          {notification.description}
        </span>
        <span className="mt-0.5 block text-[11px] text-muted-foreground/80">
          {notification.time}
        </span>
      </span>
    </>
  );
}
