import {HandCoins, Smartphone} from "lucide-react";
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
    <div
      role="radiogroup"
      aria-label="Payment type"
      className="grid gap-3 sm:grid-cols-2"
    >
      <button
        type="button"
        role="radio"
        aria-checked={paymentType === "cash"}
        onClick={() => onPaymentTypeChange("cash")}
        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${paymentType === "cash" ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted/40"}`}
      >
        <HandCoins
          className={`size-5 shrink-0 ${paymentType === "cash" ? "text-primary" : "text-muted-foreground"}`}
        />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">
            Cash on hand
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Pay in person at pickup
          </span>
        </span>
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={paymentType === "online"}
        disabled
        onClick={() => onPaymentTypeChange("online")}
        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed ${paymentType === "online" ? "border-primary bg-primary/5" : "border-border bg-muted/30 opacity-70"}`}
      >
        <Smartphone
          className={`size-5 shrink-0 ${paymentType === "online" ? "text-primary" : "text-muted-foreground"}`}
        />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">
            Online payment
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Pay via GCash or Maya
          </span>
        </span>
      </button>
    </div>
  );
}