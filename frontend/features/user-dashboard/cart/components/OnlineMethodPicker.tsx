"use client";

import {OnlineMethodSelector} from "@/features/user-dashboard/payment/components/OnlineMethodSelector";
import type {OnlinePaymentMethod} from "@/features/user-dashboard/payment/types/IPaymongo";

type OnlineMethodPickerProps = {
  method: OnlinePaymentMethod;
  onMethodChange: (method: OnlinePaymentMethod) => void;
};

export function OnlineMethodPicker({
  method,
  onMethodChange,
}: OnlineMethodPickerProps) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold text-foreground">
        How would you like to pay?
      </span>
      <OnlineMethodSelector
        method={method}
        onMethodChange={onMethodChange}
      />
      <p className="text-xs text-muted-foreground">
        You will enter your payment details on the next page.
      </p>
    </div>
  );
}