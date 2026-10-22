import {StatCard} from "@/components/ui/stat-card";
import {
  ClipboardText,
  Hourglass,
  Repeat,
  ShoppingCart,
} from "@/components/ui/stat-icons";
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
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
      <StatCard
        label="Total records"
        value={orders.length}
        icon={<ClipboardText />}
        isLoading={isLoading}
      />
      <StatCard
        label="Buy orders"
        value={buyCount}
        icon={<ShoppingCart />}
        isLoading={isLoading}
      />
      <StatCard
        label="Rent orders"
        value={rentCount}
        icon={<Repeat />}
        isLoading={isLoading}
      />
      <StatCard
        label="Pending"
        value={pendingCount}
        icon={<Hourglass />}
        isLoading={isLoading}
      />
    </div>
  );
}
