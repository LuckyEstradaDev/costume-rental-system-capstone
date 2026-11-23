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
import {buildAdminOrderPath, buildOrderPath} from "@/lib/reference-path";

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

export function NotificationDropdown({admin = false}: {admin?: boolean}) {
  const {notifications, unreadCount, markAsRead} = useUserNotification(admin);
  const buildPath = admin ? buildAdminOrderPath : buildOrderPath;

  const handleNotificationClick = (
    notification: INotification,
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

      <DropdownMenuContent align="end" className="w-[22rem] max-w-[calc(100vw-2rem)]">
        <DropdownMenuLabel className="flex items-center justify-between gap-3 text-base font-semibold text-foreground">
          <span>Notifications</span>
          <span className="text-sm font-normal text-secondary">
            {unreadCount} unread
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <DropdownMenuItem
            disabled
            className="justify-center py-4 text-base text-secondary"
          >
            No notifications
          </DropdownMenuItem>
        ) : (
          <div className="max-h-[min(17rem,50dvh)] overflow-y-auto">
            {[...notifications]
              .sort((a, b) => {
                const aTime = new Date(
                  a.createdAt ?? a.updatedAt ?? 0,
                ).getTime();
                const bTime = new Date(
                  b.createdAt ?? b.updatedAt ?? 0,
                ).getTime();
                return bTime - aTime;
              })
              .map((notification, index) => {
                const Icon = getNotificationIcon(notification.type);
                const href = buildPath(notification.orderReferenceId);

                return (
                  <DropdownMenuItem
                    key={notification._id || index}
                    asChild={Boolean(href)}
                    className="items-start gap-2 py-2"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {href ? (
                      <Link href={href}>
                        <NotificationRow
                          notification={notification}
                          Icon={Icon}
                        />
                      </Link>
                    ) : (
                      <NotificationRow
                        notification={notification}
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
    time?: string;
  };
  Icon: LucideIcon;
}) {
  return (
    <>
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-primary">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="min-w-0 break-words text-base leading-snug font-semibold">
            {notification.title}
          </span>
          {notification.unread && (
            <span className="size-1.5 shrink-0 rounded-full bg-primary" />
          )}
        </span>
        <span className="mt-0.5 block break-words text-base leading-snug text-secondary">
          {notification.description}
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-secondary/80">
          {notification.time || formatTime(notification.createdAt)}
        </span>
      </span>
    </>
  );
}
