import {CalendarClock, ShoppingBag} from "lucide-react";
import type {CheckoutMode} from "../types/checkout";

type CheckoutModeSelectorProps = {
  checkoutMode: CheckoutMode;
  onCheckoutModeChange: (mode: CheckoutMode) => void;
};

export function CheckoutModeSelector({
  checkoutMode,
  onCheckoutModeChange,
}: CheckoutModeSelectorProps) {
  const isRent = checkoutMode === "rent";

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Checkout mode
      </span>
      <div
        role="radiogroup"
        aria-label="Checkout mode"
        className="grid grid-cols-2 gap-1 rounded-full border border-border bg-muted/30 p-1"
      >
        <button
          type="button"
          role="radio"
          aria-checked={isRent}
          onClick={() => onCheckoutModeChange("rent")}
          className={`flex cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${isRent ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
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
          className={`flex cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${!isRent ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
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