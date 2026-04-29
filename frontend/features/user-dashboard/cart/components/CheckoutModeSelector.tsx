import {CalendarClock, ShoppingBag} from "lucide-react";
import {Button} from "@/components/ui/button";
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
    <div className="grid grid-cols-2 gap-2">
      <Button
        type="button"
        variant={isRent ? "default" : "outline"}
        className="justify-center"
        onClick={() => onCheckoutModeChange("rent")}
      >
        <CalendarClock className="size-4" />
        Rent
      </Button>
      <Button
        type="button"
        variant={!isRent ? "default" : "outline"}
        className="justify-center"
        onClick={() => onCheckoutModeChange("buy")}
      >
        <ShoppingBag className="size-4" />
        Buy
      </Button>
    </div>
  );
}
