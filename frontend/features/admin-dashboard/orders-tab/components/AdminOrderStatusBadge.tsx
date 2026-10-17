import {StatusBadge} from "@/components/ui/status-badge";
import type {AdminOrderStatus} from "../types/IAdminOrder";

type AdminOrderStatusBadgeProps = {
  status: AdminOrderStatus;
};

export function AdminOrderStatusBadge({status}: AdminOrderStatusBadgeProps) {
  return <StatusBadge status={status} />;
}
