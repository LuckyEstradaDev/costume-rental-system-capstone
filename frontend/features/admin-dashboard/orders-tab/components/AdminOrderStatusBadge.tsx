import {StatusBadge} from "@/components/ui/status-badge";
import type {AdminOrderStatus} from "../types/IAdminOrder";

type AdminOrderStatusBadgeProps = {
  status: AdminOrderStatus;
  type?: "purchase" | "rent";
};

export function AdminOrderStatusBadge({
  status,
  type,
}: AdminOrderStatusBadgeProps) {
  return <StatusBadge status={status} type={type} />;
}
