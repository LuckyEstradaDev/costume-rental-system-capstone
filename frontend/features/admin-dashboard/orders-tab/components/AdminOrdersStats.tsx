import {AlertCircle, CalendarClock, Package, ShoppingBag} from "lucide-react";
import {StatCard} from "@/components/ui/stat-card";
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
      <StatCard
        label="Total records"
        value={orders.length}
        icon={labelIconMap["Total records"]}
      />
      <StatCard
        label="Buy orders"
        value={buyCount}
        icon={labelIconMap["Buy orders"]}
      />
      <StatCard
        label="Rent orders"
        value={rentCount}
        icon={labelIconMap["Rent orders"]}
      />
      <StatCard
        label="Pending"
        value={pendingCount}
        icon={labelIconMap.Pending}
      />
    </div>
  );
}
