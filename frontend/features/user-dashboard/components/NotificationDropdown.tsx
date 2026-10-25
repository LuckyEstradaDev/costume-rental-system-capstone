/* eslint-disable @typescript-eslint/no-explicit-any */
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
import {buildOrderPath} from "@/lib/reference-path";

const getNotificationHref = (notification: INotification) => {
  if (notification.orderReferenceId) {
    return buildOrderPath(notification.orderReferenceId) || undefined;
  }
  return undefined;
};

const formatTime = (date?: Date | string) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function NotificationDropdown() {
  const {notifications, unreadCount, markAsRead} = useUserNotification();

  const handleNotificationClick = (
    notification: INotification & {_id?: string},
  ) => {
    if (notification.unread && notification._id) {
      markAsRead(notification._id);
    }
  };

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
          <div className="max-h-[216px] overflow-y-auto">
            {[...notifications]
              .sort((a, b) => {
                const aTime = new Date(
                  (a as any).createdAt || (a as any).updatedAt || 0,
                ).getTime();
                const bTime = new Date(
                  (b as any).createdAt || (b as any).updatedAt || 0,
                ).getTime();
                return bTime - aTime;
              })
              .map((notification, index) => {
                const Icon = getNotificationIcon(notification.type);
                const href = getNotificationHref(notification);

                const notificationWithId = notification as INotification & {
                  _id?: string;
                };

                return (
                  <DropdownMenuItem
                    key={notificationWithId._id || index}
                    asChild={Boolean(href)}
                    className="items-start gap-2.5 py-2"
                    onClick={() => handleNotificationClick(notificationWithId)}
                  >
                    {href ? (
                      <Link href={href}>
                        <NotificationRow
                          notification={notificationWithId}
                          Icon={Icon}
                        />
                      </Link>
                    ) : (
                      <NotificationRow
                        notification={notificationWithId}
                        Icon={Icon}
                      />
                    )}
                  </DropdownMenuItem>
                );
              })}
          </div>
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
