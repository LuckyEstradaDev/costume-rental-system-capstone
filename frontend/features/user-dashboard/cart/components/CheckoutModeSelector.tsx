"use client";

import {AlertDialogComponent} from "@/components/AlertDialog";
import {CalendarClock, ShoppingBag} from "lucide-react";
import {SlidingThumb, useSlidingThumb} from "@/components/ui/use-sliding-thumb";
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

  const renderOption = (mode: CheckoutMode, label: string, Icon: typeof CalendarClock) => {
    const isActive = checkoutMode === mode;
    const selectMode = () => onCheckoutModeChange(mode);
    const button = (
      <button
        type="button"
        role="radio"
        aria-checked={isActive}
        onClick={compact ? undefined : selectMode}
        data-segmented-active={isActive ? "true" : undefined}
        className={optionClass(isActive)}
      >
        <Icon className={iconClass(isActive)} />
        {label}
      </button>
    );

    if (!compact) return button;

    return (
      <AlertDialogComponent
        action={selectMode}
        title={mode === "rent" ? "Rent the selected items?" : "Buy the selected items?"}
        description="This changes the checkout mode for your cart."
        actionLabel={label}
      >
        {button}
      </AlertDialogComponent>
    );
  };

  return (
    <div className={compact ? "" : "space-y-2"}>
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
        {renderOption("rent", "Rent", CalendarClock)}
        {renderOption("purchase", "Buy", ShoppingBag)}
      </div>
    </div>
  );
}
