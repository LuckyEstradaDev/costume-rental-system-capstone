import {StatusBadge} from "@/components/ui/status-badge";
import {TrackingStatus} from "../types/IOrderTracking";

export function OrderStatusBadge({status}: {status: TrackingStatus}) {
  return <StatusBadge status={status} />;
}
