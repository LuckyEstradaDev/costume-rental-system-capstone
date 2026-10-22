"use client";

import {CalendarClock, Layers, ShoppingBag} from "lucide-react";

import {
  SEGMENTED_BUTTON_CLASS,
  SEGMENTED_COUNT_CLASS,
  SEGMENTED_ICON_CLASS,
  SEGMENTED_TRACK_CLASS,
} from "@/components/ui/segmented";
import {
  SlidingThumb,
  useSlidingThumb,
} from "@/components/ui/use-sliding-thumb";
import {cn} from "@/lib/utils";

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
  const {trackRef, thumb} = useSlidingThumb(activeFilter);

  const optionClass = (isActive: boolean) =>
    cn(
      "relative z-10",
      SEGMENTED_BUTTON_CLASS,
      isActive
        ? // The fill slides behind the options, so the active one only carries
          // the text colour. Until the fill has been measured the option
          // paints its own background.
          thumb
          ? "text-primary-foreground"
          : "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground",
    );

  const countClass = (isActive: boolean) =>
    cn(
      SEGMENTED_COUNT_CLASS,
      isActive ? "text-primary-foreground/80" : "text-muted-foreground",
    );

  return (
    <div
      ref={trackRef}
      role="tablist"
      aria-label="Order types"
      className={cn(SEGMENTED_TRACK_CLASS, "w-fit")}
    >
      {thumb ? <SlidingThumb thumb={thumb} /> : null}
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
            data-segmented-active={isActive ? "true" : undefined}
            className={optionClass(isActive)}
          >
            <Icon
              className={cn(
                SEGMENTED_ICON_CLASS,
                isActive && "text-primary-foreground",
              )}
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
