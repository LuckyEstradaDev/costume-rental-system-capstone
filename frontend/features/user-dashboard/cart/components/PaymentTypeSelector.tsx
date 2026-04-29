import {HandCoins, Smartphone} from "lucide-react";
import {Button} from "@/components/ui/button";
import type {PaymentType} from "../types/checkout";

type PaymentTypeSelectorProps = {
  paymentType: PaymentType;
  onPaymentTypeChange: (type: PaymentType) => void;
};

export function PaymentTypeSelector({
  paymentType,
  onPaymentTypeChange,
}: PaymentTypeSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Button
        type="button"
        variant={paymentType === "cash" ? "default" : "outline"}
        className="h-auto justify-start p-4"
        onClick={() => onPaymentTypeChange("cash")}
      >
        <HandCoins className="size-4" />
        <span className="text-left">Cash on hand</span>
      </Button>
      <Button
        type="button"
        variant={paymentType === "online" ? "default" : "outline"}
        className="h-auto justify-start p-4"
        onClick={() => onPaymentTypeChange("online")}
      >
        <Smartphone className="size-4" />
        <span className="text-left">Online payment</span>
      </Button>
    </div>
  );
}
