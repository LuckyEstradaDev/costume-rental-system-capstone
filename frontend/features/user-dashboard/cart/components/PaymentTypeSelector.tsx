"use client";

import {useId, useState} from "react";
import {ChevronDown, HandCoins, Smartphone} from "lucide-react";
import {cn} from "@/lib/utils";
import {OnlineMethodSelector} from "@/features/user-dashboard/payment/components/OnlineMethodSelector";
import type {OnlinePaymentMethod} from "@/features/user-dashboard/payment/types/IPaymongo";
import type {PaymentType} from "../types/checkout";

type PaymentTypeSelectorProps = {
  paymentType: PaymentType;
  onPaymentTypeChange: (type: PaymentType) => void;
  onlinePaymentMethod: OnlinePaymentMethod;
  onOnlinePaymentMethodChange: (method: OnlinePaymentMethod) => void;
};

export function PaymentTypeSelector({
  paymentType,
  onPaymentTypeChange,
  onlinePaymentMethod,
  onOnlinePaymentMethodChange,
}: PaymentTypeSelectorProps) {
  const [isOnlineOpen, setIsOnlineOpen] = useState(paymentType === "online");
  const paymentTypeName = useId();
  const onlinePanelId = useId();

  const selectCash = () => {
    onPaymentTypeChange("cash");
    setIsOnlineOpen(false);
  };

  const selectOnline = () => {
    onPaymentTypeChange("online");
    setIsOnlineOpen(true);
  };

  const toggleOnline = () => {
    if (paymentType !== "online") {
      selectOnline();
      return;
    }

    setIsOnlineOpen((open) => !open);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <label
        className={cn(
          "flex cursor-pointer items-center gap-3 p-4 transition-colors focus-within:ring-2 focus-within:ring-ring/50",
          paymentType === "cash"
            ? "bg-primary/5"
            : "bg-background hover:bg-muted/40",
        )}
      >
        <input
          type="radio"
          name={paymentTypeName}
          value="cash"
          checked={paymentType === "cash"}
          onChange={selectCash}
          className="sr-only"
        />
        <RadioIndicator active={paymentType === "cash"} />
        <HandCoins
          className={cn(
            "size-5 shrink-0",
            paymentType === "cash" ? "text-primary" : "text-muted-foreground",
          )}
        />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">
            Cash on hand
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Pay in person at pickup
          </span>
        </span>
      </label>

      <div className="border-t border-border">
        <div
          className={cn(
            "flex items-center transition-colors",
            paymentType === "online"
              ? "bg-primary/5"
              : "bg-background hover:bg-muted/40",
          )}
        >
          <label
            onClick={selectOnline}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 p-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50"
          >
            <input
              type="radio"
              name={paymentTypeName}
              value="online"
              checked={paymentType === "online"}
              onChange={selectOnline}
              className="sr-only"
            />
            <RadioIndicator active={paymentType === "online"} />
            <Smartphone
              className={cn(
                "size-5 shrink-0",
                paymentType === "online"
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">
                Online payment
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Pay securely with QR Ph
              </span>
            </span>
          </label>
          <button
            type="button"
            aria-label={
              isOnlineOpen
                ? "Collapse online payment methods"
                : "Expand online payment methods"
            }
            aria-expanded={isOnlineOpen}
            aria-controls={onlinePanelId}
            onClick={toggleOnline}
            className="mr-3 grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                isOnlineOpen && "rotate-180",
              )}
            />
          </button>
        </div>

        <div
          id={onlinePanelId}
          hidden={!isOnlineOpen}
          className="border-t border-border bg-muted/10 p-4"
        >
          <OnlineMethodSelector
            method={onlinePaymentMethod}
            onMethodChange={onOnlinePaymentMethodChange}
          />
        </div>
      </div>
    </div>
  );
}

function RadioIndicator({active}: {active: boolean}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-4 shrink-0 place-items-center rounded-full border transition-colors",
        active ? "border-primary" : "border-input",
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full bg-primary transition-transform",
          active ? "scale-100" : "scale-0",
        )}
      />
    </span>
  );
}
