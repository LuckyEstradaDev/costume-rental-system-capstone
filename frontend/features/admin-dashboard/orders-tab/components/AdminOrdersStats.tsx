import {StatCard} from "@/components/ui/stat-card";
import type {AdminOrderItem} from "../types/IAdminOrder";

type AdminOrdersStatsProps = {
  orders: AdminOrderItem[];
  isLoading?: boolean;
};

export function AdminOrdersStats({orders, isLoading}: AdminOrdersStatsProps) {
  const buyCount = orders.filter((order) => order.type === "purchase").length;
  const rentCount = orders.filter((order) => order.type === "rent").length;
  const pendingCount = orders.filter(
    (order) => order.status === "pending",
  ).length;

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-4 md:grid-cols-4">
      <StatCard
        label="Total records"
        value={orders.length}
        isLoading={isLoading}
      />
      <StatCard label="Buy orders" value={buyCount} isLoading={isLoading} />
      <StatCard label="Rent orders" value={rentCount} isLoading={isLoading} />
      <StatCard label="Pending" value={pendingCount} isLoading={isLoading} />
    </div>
  );
}
