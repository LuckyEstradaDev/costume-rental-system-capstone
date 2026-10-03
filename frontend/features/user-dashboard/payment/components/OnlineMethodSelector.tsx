"use client";

import {CreditCard, QrCode, Smartphone, Wallet} from "lucide-react";
import {cn} from "@/lib/utils";
import {
  METHOD_HINTS,
  METHOD_LABELS,
  ONLINE_PAYMENT_METHODS,
  type OnlinePaymentMethod,
} from "../types/IPaymongo";

const METHOD_ICONS = {
  card: CreditCard,
  gcash: Wallet,
  paymaya: Smartphone,
  qrph: QrCode,
};

type OnlineMethodSelectorProps = {
  method: OnlinePaymentMethod;
  onMethodChange: (method: OnlinePaymentMethod) => void;
};

export function OnlineMethodSelector({
  method,
  onMethodChange,
}: OnlineMethodSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Online payment method"
      className="grid grid-cols-2 gap-2 sm:grid-cols-4"
    >
      {ONLINE_PAYMENT_METHODS.map((value) => {
        const Icon = METHOD_ICONS[value];
        const isActive = method === value;

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onMethodChange(value)}
            className={cn(
              "flex cursor-pointer flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              isActive
                ? "border-primary bg-primary/5"
                : "border-border bg-background hover:bg-muted/40",
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            />
            <span
              className={cn(
                "text-sm font-semibold",
                isActive ? "text-foreground" : "text-foreground/80",
              )}
            >
              {METHOD_LABELS[value]}
            </span>
            <span className="text-[11px] leading-tight text-muted-foreground">
              {METHOD_HINTS[value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}