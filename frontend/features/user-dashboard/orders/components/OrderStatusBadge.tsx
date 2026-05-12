import {Badge} from "@/components/ui/badge";
import {TrackingStatus} from "../types/IOrderTracking";

export function OrderStatusBadge({status}: {status: TrackingStatus}) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  if (status === "cancelled" || status === "overdue") {
    return <Badge variant="destructive">{label}</Badge>;
  }

  if (status === "returned" || status === "delivered") {
    return <Badge variant="secondary">{label}</Badge>;
  }

  return <Badge>{label}</Badge>;
}
