import {Card} from "@/components/ui/card";
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
      <StatsCard label="Orders" value={orderCount} />
      <StatsCard label="Rents" value={rentCount} />
      <StatsCard label="In progress" value={activeCount} />
    </div>
  );
}

type StatsCardProps = {
  label: string;
  value: number;
};

function StatsCard({label, value}: StatsCardProps) {
  return (
    <Card className="p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </Card>
  );
}
