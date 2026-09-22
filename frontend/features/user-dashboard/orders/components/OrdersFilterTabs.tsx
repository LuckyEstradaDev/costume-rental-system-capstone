import {CalendarClock, Layers, ShoppingBag} from "lucide-react";

type OrdersFilterTabsProps = {
  activeFilter: "purchase" | "rent" | "all";
  onFilterChange: (filter: "purchase" | "rent" | "all") => void;
  counts?: {all: number; purchase: number; rent: number};
};

const filters: {
  label: string;
  value: "purchase" | "rent" | "all";
  icon: typeof Layers;
}[] = [
  {label: "All", value: "all", icon: Layers},
  {label: "Purchased", value: "purchase", icon: ShoppingBag},
  {label: "Rented", value: "rent", icon: CalendarClock},
];

export function OrdersFilterTabs({
  activeFilter,
  onFilterChange,
  counts,
}: OrdersFilterTabsProps) {
  const optionClass = (isActive: boolean) =>
    `flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`;

  const countClass = (isActive: boolean) =>
    `text-[11px] ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`;

  return (
    <div
      role="tablist"
      aria-label="Order types"
      className="flex w-fit gap-1 rounded-full border border-border bg-muted/30 p-1"
    >
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;
        const Icon = filter.icon;
        const count = counts?.[filter.value];

        return (
          <button
            key={filter.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onFilterChange(filter.value)}
            className={optionClass(isActive)}
          >
            <Icon
              className={`size-4 ${isActive ? "text-primary-foreground" : ""}`}
            />
            {filter.label}
            {count !== undefined && count > 0 ? (
              <span className={countClass(isActive)}>{count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}