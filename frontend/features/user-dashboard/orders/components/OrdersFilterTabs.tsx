import {Button} from "@/components/ui/button";
import type {TrackingType} from "../types/IOrderTracking";

export type OrdersFilter = "all" | TrackingType;

type OrdersFilterTabsProps = {
  activeFilter: OrdersFilter;
  onFilterChange: (filter: OrdersFilter) => void;
};

const filters: {label: string; value: OrdersFilter}[] = [
  {label: "All", value: "all"},
  {label: "Orders", value: "order"},
  {label: "Rents", value: "rent"},
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
