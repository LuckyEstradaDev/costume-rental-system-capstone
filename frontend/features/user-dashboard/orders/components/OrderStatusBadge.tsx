import {Badge} from "@/components/ui/badge";
import {formatStatusLabel} from "@/lib/formatters";
import {TrackingStatus} from "../types/IOrderTracking";

export function OrderStatusBadge({status}: {status: TrackingStatus}) {
  const label = formatStatusLabel(status);

  if (status === "cancelled" || status === "overdue") {
    return <Badge variant="destructive">{label}</Badge>;
  }

  if (status === "returned" || status === "received") {
    return <Badge variant="secondary">{label}</Badge>;
  }

  return <Badge>{label}</Badge>;
}
