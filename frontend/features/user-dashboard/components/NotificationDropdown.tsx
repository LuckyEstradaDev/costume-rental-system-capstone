"use client";

import Link from "next/link";
import {Bell} from "lucide-react";
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
import {useUserNotification} from "../notifications/hooks/useUserNotification";
import type {INotification} from "../notifications/types/INotification";
import {getNotificationIcon} from "../notifications/utils/iconMapper";

const getNotificationHref = (notification: INotification) => {
  if (notification.orderId) {
    return `/dashboard/orders/${notification.orderId}`;
  }
  return undefined;
};

const formatTime = (date?: Date | string) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString();
};

export function NotificationDropdown() {
  const {notifications, unreadCount} = useUserNotification();

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

        {notifications.length === 0 ? (
          <DropdownMenuItem
            disabled
            className="justify-center py-4 text-sm text-muted-foreground"
          >
            No notifications
          </DropdownMenuItem>
        ) : (
          notifications.map((notification, index) => {
            const Icon = getNotificationIcon(notification.type);
            const href = getNotificationHref(notification);

            return (
              <DropdownMenuItem
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                key={(notification as any)._id || index}
                asChild={Boolean(href)}
                className="items-start gap-2.5 py-2"
              >
                {href ? (
                  <Link href={href}>
                    <NotificationRow notification={notification} Icon={Icon} />
                  </Link>
                ) : (
                  <NotificationRow notification={notification} Icon={Icon} />
                )}
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationRow({
  notification,
  Icon,
}: {
  notification: INotification & {
    _id?: string;
    createdAt?: Date | string;
    time?: string;
  };
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
          {notification.time || formatTime(notification.createdAt)}
        </span>
      </span>
    </>
  );
}
