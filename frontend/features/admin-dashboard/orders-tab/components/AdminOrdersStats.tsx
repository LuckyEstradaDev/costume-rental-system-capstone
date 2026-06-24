import {AlertCircle, CalendarClock, Package, ShoppingBag} from "lucide-react";
import {Card} from "@/components/ui/card";
import type {AdminOrderItem} from "../types/IAdminOrder";

type AdminOrdersStatsProps = {
  orders: AdminOrderItem[];
};

const labelIconMap: Record<string, typeof Package> = {
  "Total records": Package,
  "Buy orders": ShoppingBag,
  "Rent orders": CalendarClock,
  Pending: AlertCircle,
};

export function AdminOrdersStats({orders}: AdminOrdersStatsProps) {
  const buyCount = orders.filter((order) => order.type === "purchase").length;
  const rentCount = orders.filter((order) => order.type === "rent").length;
  const pendingCount = orders.filter(
    (order) => order.status === "pending",
  ).length;

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
  const Icon = labelIconMap[label] || Package;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
      </div>
    </Card>
  );
}
