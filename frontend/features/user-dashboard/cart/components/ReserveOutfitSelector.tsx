"use client";

import {useId} from "react";
import {CalendarClock} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox";
import {PaymentTypeSelector} from "./PaymentTypeSelector";
import type {ReservationPaymentMethod} from "../types/checkout";
import {cn} from "@/lib/utils";

type ReserveOutfitSelectorProps = {
  reserveOutfit: boolean;
  onReserveOutfitChange: (checked: boolean) => void;
  reservationPaymentMethod: ReservationPaymentMethod;
  onReservationPaymentMethodChange: (method: ReservationPaymentMethod) => void;
};

export function ReserveOutfitSelector({
  reserveOutfit,
  onReserveOutfitChange,
  reservationPaymentMethod,
  onReservationPaymentMethodChange,
}: ReserveOutfitSelectorProps) {
  const reservationId = useId();
  const headingId = useId();
  const paymentPanelId = useId();

  return (
    <div
      role="group"
      aria-labelledby={headingId}
      className={cn(
        "rounded-lg border border-border transition-colors",
        reserveOutfit ? "bg-background" : "bg-background hover:bg-muted/40",
      )}
    >
      <h3 id={headingId} className="px-4 pt-4 text-base font-semibold text-primary">
        Reservation payment
      </h3>
      <div className="flex items-center gap-3 p-4">
        <Checkbox
          id={reservationId}
          aria-controls={paymentPanelId}
          checked={reserveOutfit}
          onCheckedChange={(checked) => onReserveOutfitChange(checked === true)}
        />
        <label
          htmlFor={reservationId}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
        >
          <CalendarClock
            className={cn(
              "size-5 shrink-0",
              reserveOutfit ? "text-primary" : "text-muted-foreground",
            )}
          />
          <span className="min-w-0">
            <span className="block text-base font-semibold text-foreground leading-relaxed">
              Reserve outfit (50%)
            </span>
            <span className="mt-0.5 block text-base text-muted-foreground leading-relaxed">
              Pay the 50% reservation fee online or in cash, then pay the remaining balance.
            </span>
          </span>
        </label>
      </div>

      <div
        id={paymentPanelId}
        inert={!reserveOutfit}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none",
          reserveOutfit ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <PaymentTypeSelector
            isBalancePayment={false}
            isReservationPayment
            className="rounded-lg border-x-0 border-b-0"
            paymentType={reservationPaymentMethod === "cash" ? "cash" : "online"}
            onPaymentTypeChange={(type) =>
              onReservationPaymentMethodChange(
                type === "cash" ? "cash" : reservationPaymentMethod === "cash" ? "qrph" : reservationPaymentMethod,
              )
            }
            onlinePaymentMethod={reservationPaymentMethod === "cash" ? "qrph" : reservationPaymentMethod}
            onOnlinePaymentMethodChange={onReservationPaymentMethodChange}
          />
        </div>
      </div>
    </div>
  );
}
