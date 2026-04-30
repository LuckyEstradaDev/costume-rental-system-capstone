import {Badge} from "@/components/ui/badge";
import type {TrackingStatus} from "../types/IOrderTracking";

type OrderStatusBadgeProps = {
  status: TrackingStatus;
};

export function OrderStatusBadge({status}: OrderStatusBadgeProps) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  if (status === "cancelled" || status === "overdue") {
    return <Badge variant="destructive">{label}</Badge>;
  }

  if (status === "returned" || status === "delivered" || status === "paid") {
    return <Badge variant="secondary">{label}</Badge>;
  }

  return <Badge>{label}</Badge>;
}
