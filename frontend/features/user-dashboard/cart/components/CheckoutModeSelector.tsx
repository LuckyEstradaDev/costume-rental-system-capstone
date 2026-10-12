import {CalendarClock, ShoppingBag} from "lucide-react";
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

  return (
    <div className={compact ? "" : "space-y-2"}>
      {!compact ? (
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Checkout mode
        </span>
      ) : null}
      <div
        role="radiogroup"
        aria-label="Checkout mode"
        className={`grid grid-cols-2 gap-1 rounded-full border border-border bg-muted/30 ${compact ? "p-0.5" : "p-1"}`}
      >
        <button
          type="button"
          role="radio"
          aria-checked={isRent}
          onClick={() => onCheckoutModeChange("rent")}
          className={`flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"} ${isRent ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <CalendarClock
            className={`size-4 transition-colors ${isRent ? "text-primary-foreground" : ""}`}
          />
          Rent
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={!isRent}
          onClick={() => onCheckoutModeChange("purchase")}
          className={`flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"} ${!isRent ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <ShoppingBag
            className={`size-4 transition-colors ${!isRent ? "text-primary-foreground" : ""}`}
          />
          Buy
        </button>
      </div>
    </div>
  );
}