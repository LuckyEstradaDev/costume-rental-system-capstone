"use client";

import {CalendarClock, ShoppingBag} from "lucide-react";
import {
  SlidingThumb,
  useSlidingThumb,
} from "@/components/ui/use-sliding-thumb";
import {cn} from "@/lib/utils";
import type {CheckoutMode} from "../types/checkout";

type CheckoutModeSelectorProps = {
  checkoutMode: CheckoutMode;
  onCheckoutModeChange: (mode: CheckoutMode) => void;
  compact?: boolean;
};

export function CheckoutModeSelector({
  checkoutMode,
  onCheckoutModeChange,
  compact = false,
}: CheckoutModeSelectorProps) {
  const isRent = checkoutMode === "rent";
  const {trackRef, thumb} = useSlidingThumb(checkoutMode);

  // The same compact mobile sizing the other toggles use, so every pill
  // control in the app reads the same on a phone.
  const optionClass = (isActive: boolean) =>
    cn(
      "relative z-10 flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-full font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
      compact
        ? "px-2 py-1.5 text-xs"
        : "px-2.5 py-1.5 text-xs sm:gap-2 sm:px-3 sm:py-2 sm:text-sm",
      isActive
        ? // The fill slides between the two halves, so the active one only
          // carries the text colour. Until the fill has been measured the
          // option paints its own background.
          thumb
          ? "text-primary-foreground"
          : "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground",
    );

  const iconClass = (isActive: boolean) =>
    cn(
      "hidden shrink-0 transition-colors sm:block sm:size-4",
      isActive && "text-primary-foreground",
    );

  return (
    <div className={compact ? "" : "space-y-2"}>
      {!compact ? (
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Checkout mode
        </span>
      ) : null}
      <div
        ref={trackRef}
        role="radiogroup"
        aria-label="Checkout mode"
        className={cn(
          "relative grid grid-cols-2 gap-1 rounded-full border border-border bg-muted/30",
          compact ? "p-0.5" : "p-1",
        )}
      >
        {thumb ? <SlidingThumb thumb={thumb} /> : null}
        <button
          type="button"
          role="radio"
          aria-checked={isRent}
          onClick={() => onCheckoutModeChange("rent")}
          data-segmented-active={isRent ? "true" : undefined}
          className={optionClass(isRent)}
        >
          <CalendarClock className={iconClass(isRent)} />
          Rent
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={!isRent}
          onClick={() => onCheckoutModeChange("purchase")}
          data-segmented-active={!isRent ? "true" : undefined}
          className={optionClass(!isRent)}
        >
          <ShoppingBag className={iconClass(!isRent)} />
          Buy
        </button>
      </div>
    </div>
  );
}
