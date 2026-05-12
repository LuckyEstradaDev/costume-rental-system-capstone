import {Badge} from "@/components/ui/badge";
import {CheckCircle2, Clock3, XCircle} from "lucide-react";
import type {AdminOrderStatus} from "../types/IAdminOrder";

type AdminOrderStatusBadgeProps = {
  status: AdminOrderStatus;
};

export function AdminOrderStatusBadge({status}: AdminOrderStatusBadgeProps) {
  const variant =
    status === "cancelled" || status === "overdue"
      ? "destructive"
      : status === "pending"
        ? "outline"
        : "secondary";

  const Icon =
    status === "cancelled" || status === "overdue"
      ? XCircle
      : status === "returned" || status === "delivered"
        ? CheckCircle2
        : Clock3;

  return (
    <Badge variant={variant} className="gap-1.5">
      <Icon className="size-3.5" />
      <span className="capitalize">{status}</span>
    </Badge>
  );
}
