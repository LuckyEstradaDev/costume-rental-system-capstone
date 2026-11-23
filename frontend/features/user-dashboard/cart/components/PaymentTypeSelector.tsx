"use client";

import {useId, useState} from "react";
import {ChevronDown, HandCoins, Smartphone} from "lucide-react";
import {cn} from "@/lib/utils";
import {OnlineMethodSelector} from "@/features/user-dashboard/payment/components/OnlineMethodSelector";
import type {OnlinePaymentMethod} from "@/features/user-dashboard/payment/types/IPaymongo";
import type {PaymentType} from "../types/checkout";

type PaymentTypeSelectorProps = {
  paymentType: PaymentType;
  cashOnly?: boolean;
  isBalancePayment: boolean;
  isReservationPayment?: boolean;
  className?: string;
  onPaymentTypeChange: (type: PaymentType) => void;
  onlinePaymentMethod: OnlinePaymentMethod;
  onOnlinePaymentMethodChange: (method: OnlinePaymentMethod) => void;
};

export function PaymentTypeSelector({
  paymentType,
  cashOnly = false,
  isBalancePayment,
  isReservationPayment = false,
  className,
  onPaymentTypeChange,
  onlinePaymentMethod,
  onOnlinePaymentMethodChange,
}: PaymentTypeSelectorProps) {
  const [isMethodOpen, setIsMethodOpen] = useState(paymentType === "online");
  const paymentTypeName = useId();
  const headingId = useId();
  const onlinePanelId = useId();
  const isCashSelected = cashOnly || paymentType === "cash";

  const selectCash = () => {
    onPaymentTypeChange("cash");
    setIsMethodOpen(false);
  };

  const selectOnline = () => {
    onPaymentTypeChange("online");
    setIsMethodOpen(true);
  };

  return (
    <div role="group" aria-labelledby={headingId} className={cn("overflow-hidden rounded-lg border border-border", className)}>
      <h3 id={headingId} className="px-4 pt-4 text-base font-semibold text-primary">
        {isReservationPayment ? "Reservation payment method" : isBalancePayment ? "Final payment" : "Full payment"}
      </h3>
      <label
        className={cn(
          "flex cursor-pointer items-center gap-3 p-4 transition-colors focus-within:ring-2 focus-within:ring-ring/50",
          isCashSelected
            ? "bg-background"
            : "bg-background hover:bg-muted/40",
        )}
      >
        <input
          type="radio"
          name={paymentTypeName}
          value="cash"
          checked={isCashSelected}
          onChange={selectCash}
          className="sr-only"
        />
        <RadioIndicator active={isCashSelected} />
        <HandCoins
          className={cn(
            "size-5 shrink-0",
            isCashSelected ? "text-primary" : "text-muted-foreground",
          )}
        />
        <span className="min-w-0">
          <span className="block text-base font-semibold text-foreground leading-relaxed">
            Cash on hand
          </span>
          <span className="mt-0.5 block text-base text-secondary/80 leading-relaxed">
            {isReservationPayment
              ? "Pay the 50% reservation fee in cash within 24 hours of ordering. Staff will confirm the payment and hold the outfit. The remaining balance is due at pickup."
              : isBalancePayment
              ? "Pay the remaining balance in person at pickup"
              : "Pay the full amount in person at pickup"}
          </span>
        </span>
      </label>

      <div hidden={cashOnly}>
        <div
          className={cn(
            "flex items-center transition-colors",
            paymentType === "online"
              ? "bg-background"
              : "bg-background hover:bg-muted/40",
          )}
        >
          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 p-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50">
            <input
              type="radio"
              name={paymentTypeName}
              value="online"
              checked={!cashOnly && paymentType === "online"}
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
              <span className="block text-base font-semibold text-foreground leading-relaxed">
                Online payment
              </span>
              <span className="mt-0.5 block text-base text-secondary/80 leading-relaxed">
                {process.env.NODE_ENV === "development"
                  ? "Choose QR Ph, GCash, or Maya"
                  : "Pay securely with QR Ph"}
              </span>
            </span>
          </label>
          <button
            type="button"
            aria-label={
              isMethodOpen
                ? "Collapse online payment methods"
                : "Expand online payment methods"
            }
            aria-expanded={isMethodOpen}
            aria-controls={onlinePanelId}
            onClick={() => setIsMethodOpen((open) => !open)}
            className="mr-3 grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                isMethodOpen && "rotate-180",
              )}
            />
          </button>
        </div>

        <div
          id={onlinePanelId}
          hidden={!isMethodOpen}
          className="bg-background p-4"
        >
          <OnlineMethodSelector
            method={onlinePaymentMethod}
            onMethodChange={onOnlinePaymentMethodChange}
            ariaLabel={isReservationPayment ? "Reservation online payment method" : "Final online payment method"}
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
