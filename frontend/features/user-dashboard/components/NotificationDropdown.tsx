"use client";

import {EmptyState} from "@/components/ui/empty-state";
import Link from "next/link";
import {useSyncExternalStore} from "react";
import {Bell} from "lucide-react";
import type {LucideIcon} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
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

const desktopQuery = "(min-width: 640px)";

function subscribeToViewport(onChange: () => void) {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

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
  const {
    notifications, unreadCount, markAsRead, markAllAsRead, canMarkAllAsRead,
    isMarkingAllAsRead, markAllAsReadFailed,
  } = useUserNotification(admin);
  const markAllLabel = isMarkingAllAsRead ? "Marking as read…" : "Mark all as read";
  const markAllError = markAllAsReadFailed && (
    <p role="status" className="px-2 text-sm text-destructive">
      Some notifications could not be marked as read. Try again.
    </p>
  );
  const buildPath = admin ? buildAdminOrderPath : buildOrderPath;

  const handleNotificationClick = (
    notification: INotification,
  ) => {
    if (notification.unread && notification._id) {
      markAsRead(notification._id);
    }
  };

  const isDesktop = useSyncExternalStore(
    subscribeToViewport,
    () => window.matchMedia(desktopQuery).matches,
    () => true,
  );
  const sortedNotifications = [...notifications].sort((a, b) => {
    const aTime = new Date(a.createdAt ?? a.updatedAt ?? 0).getTime();
    const bTime = new Date(b.createdAt ?? b.updatedAt ?? 0).getTime();
    return bTime - aTime;
  });

  const trigger = (
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
  );

  const rows = sortedNotifications.length === 0 ? (
    <EmptyState icon={Bell} title="No notifications" className="min-h-0 py-6" />
  ) : (
    sortedNotifications.map((notification, index) => {
      const Icon = getNotificationIcon(notification.type);
      const href = buildPath(notification.orderReferenceId);
      const row = <NotificationRow notification={notification} Icon={Icon} />;
      const onClick = () => handleNotificationClick(notification);
      const key = notification._id || index;

      if (isDesktop) {
        return (
          <DropdownMenuItem key={key} asChild={Boolean(href)} className="items-start gap-2 py-2" onClick={onClick}>
            {href ? <Link href={href}>{row}</Link> : row}
          </DropdownMenuItem>
        );
      }

      const rowClassName = "flex w-full items-start gap-2 px-2 py-3 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring";
      return (
        <DialogClose key={key} asChild>
          {href ? (
            <Link href={href} className={rowClassName} onClick={onClick}>{row}</Link>
          ) : (
            <button type="button" className={rowClassName} onClick={onClick}>{row}</button>
          )}
        </DialogClose>
      );
    })
  );

  if (!isDesktop) {
    return (
      <Dialog>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent
          placement="right"
          className="flex max-w-none flex-col gap-3 overflow-hidden rounded-none pb-[max(1rem,env(safe-area-inset-bottom))]"
          aria-describedby={undefined}
        >
          <div className="space-y-1 pr-10">
            <DialogTitle className="text-lg font-semibold">Notifications</DialogTitle>
            <button
              type="button"
              disabled={!canMarkAllAsRead}
              onClick={markAllAsRead}
              className="text-sm text-primary underline underline-offset-4 disabled:opacity-50"
            >
              {markAllLabel}
            </button>
          </div>
          {markAllError}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{rows}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] max-w-[calc(100vw-2rem)]">
        <div className="flex items-center justify-between gap-3">
          <DropdownMenuLabel className="text-sm font-semibold text-foreground">Notifications</DropdownMenuLabel>
          <DropdownMenuItem
            disabled={!canMarkAllAsRead}
            className="text-sm text-primary underline underline-offset-4"
            onSelect={(event) => {
              event.preventDefault();
              markAllAsRead();
            }}
          >
            {markAllLabel}
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator />
        {markAllError}
        <div className="max-h-[min(17rem,50dvh)] overflow-y-auto">{rows}</div>
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
          <span className="min-w-0 break-words text-sm leading-snug font-semibold">
            {notification.title}
          </span>
          {notification.unread && (
            <span className="size-1.5 shrink-0 rounded-full bg-primary" />
          )}
        </span>
        <span className="mt-0.5 block break-words text-sm leading-snug text-secondary">
          {notification.description}
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
          {notification.time || formatTime(notification.createdAt)}
        </span>
      </span>
    </>
  );
}
