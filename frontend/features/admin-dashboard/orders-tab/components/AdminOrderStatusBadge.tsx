import {Badge} from "@/components/ui/badge";
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

  return <Badge variant={variant}>{status}</Badge>;
}
