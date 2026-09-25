import {Activity, CalendarClock, ShoppingBag} from "lucide-react";
import {StatCard} from "@/components/ui/stat-card";
import {IRent} from "../../rent/types/IRent";
import {IOrder} from "../../buy/types/IOrder";

export function OrdersStats({items}: {items: (IOrder | IRent)[]}) {
  const orderCount = items.filter((item) => item.type === "purchase").length;
  const rentCount = items.filter((item) => item.type === "rent").length;
  const activeCount = items.filter(
    (item) => item.status === "pending" || item.status === "active",
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard label="Orders" value={orderCount} icon={ShoppingBag} />
      <StatCard label="Rents" value={rentCount} icon={CalendarClock} />
      <StatCard label="In progress" value={activeCount} icon={Activity} />
    </div>
  );
}
