import {Button} from "@/components/ui/button";
import {OrderTrackingType} from "../types/IOrderTracking";

type OrdersFilterTabsProps = {
  activeFilter: OrderTrackingType | "all";
  onFilterChange: (filter: OrderTrackingType | "all") => void;
};

const filters: {label: string; value: OrderTrackingType | "all"}[] = [
  {label: "All", value: "all"},
  {label: "Purchased", value: "buy"},
  {label: "Rented", value: "rent"},
];

export function OrdersFilterTabs({
  activeFilter,
  onFilterChange,
}: OrdersFilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          type="button"
          variant={activeFilter === filter.value ? "default" : "outline"}
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
