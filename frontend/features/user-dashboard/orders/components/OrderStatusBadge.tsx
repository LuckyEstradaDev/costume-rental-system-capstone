import {StatusBadge} from "@/components/ui/status-badge";
import {TrackingStatus} from "../types/IOrderTracking";

export function OrderStatusBadge({
  status,
  type,
}: {
  status: TrackingStatus;
  type?: "purchase" | "rent";
}) {
  return <StatusBadge status={status} type={type} />;
}
