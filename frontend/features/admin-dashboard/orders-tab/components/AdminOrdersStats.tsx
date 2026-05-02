import {Card} from "@/components/ui/card";
import type {AdminOrderItem} from "../types/IAdminOrder";

type AdminOrdersStatsProps = {
  orders: AdminOrderItem[];
};

export function AdminOrdersStats({orders}: AdminOrdersStatsProps) {
  const buyCount = orders.filter((order) => order.type === "buy").length;
  const rentCount = orders.filter((order) => order.type === "rent").length;
  const pendingCount = orders.filter((order) => order.status === "pending").length;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatsCard label="Total records" value={orders.length} />
      <StatsCard label="Buy orders" value={buyCount} />
      <StatsCard label="Rent orders" value={rentCount} />
      <StatsCard label="Pending" value={pendingCount} />
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
