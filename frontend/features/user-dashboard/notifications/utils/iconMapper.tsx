import {Bell, CalendarClock, CheckCircle2, PackageCheck, XCircle} from "lucide-react";
import type {LucideIcon} from "lucide-react";
import type {INotification} from "../types/INotification";

export const getNotificationIcon = (type?: INotification["type"]): LucideIcon => {
  switch (type) {
    case "success":
    case "confirmed":
      return CheckCircle2;
    case "active":
      return PackageCheck;
    case "pending":
      return CalendarClock;
    case "cancelled":
    case "refunded":
      return XCircle;
    default:
      return Bell;
  }
};
