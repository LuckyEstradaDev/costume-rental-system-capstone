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
    <div className="grid grid-cols-3 gap-2 md:gap-4">
      <StatCard
        centered
        label="Orders"
        value={orderCount}
        icon={ShoppingBag}
        className="p-3 sm:p-5"
      />
      <StatCard
        centered
        label="Rents"
        value={rentCount}
        icon={CalendarClock}
        className="p-3 sm:p-5"
      />
      <StatCard
        centered
        label="In progress"
        value={activeCount}
        icon={Activity}
        className="p-3 sm:p-5"
      />
    </div>
  );
}
