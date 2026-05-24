import {Activity, CalendarClock, ShoppingBag} from "lucide-react";
import {Card as UiCard} from "@/components/ui/card";
import {OrderTrackingItem} from "@/features/user-dashboard/orders/types/IOrderTracking";

type OrdersStatsProps = {
  items: OrderTrackingItem[];
};

export function OrdersStats({items}: OrdersStatsProps) {
  const orderCount = items.filter((item) => item.type === "buy").length;
  const rentCount = items.filter((item) => item.type === "rent").length;
  const activeCount = items.filter(
    (item) => item.status === "pending" || item.status === "active",
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatsCard label="Orders" value={orderCount} icon={ShoppingBag} />
      <StatsCard label="Rents" value={rentCount} icon={CalendarClock} />
      <StatsCard label="In progress" value={activeCount} icon={Activity} />
    </div>
  );
}

type StatsCardProps = {
  label: string;
  value: number;
  icon: typeof Activity;
};

function StatsCard({label, value, icon: Icon}: StatsCardProps) {
  return (
    <UiCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
      </div>
    </UiCard>
  );
}
