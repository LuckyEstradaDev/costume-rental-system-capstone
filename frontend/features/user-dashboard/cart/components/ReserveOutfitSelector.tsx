"use client";

import {useId} from "react";
import {CalendarClock} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox";
import {OnlineMethodSelector} from "@/features/user-dashboard/payment/components/OnlineMethodSelector";
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

  return (
    <div
      role="group"
      aria-labelledby={headingId}
      className={cn(
        "overflow-hidden rounded-lg border border-border transition-colors",
        reserveOutfit ? "bg-background" : "bg-background hover:bg-muted/40",
      )}
    >
      <h3 id={headingId} className="px-4 pt-4 text-base font-semibold text-primary">
        Reservation payment
      </h3>
      <div className="flex items-center gap-3 p-4">
        <Checkbox
          id={reservationId}
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
            <span className="mt-0.5 block text-base text-secondary/80 leading-relaxed">
              Pay the 50% reservation fee online or in cash, then pay the remaining balance.
            </span>
          </span>
        </label>
      </div>

      {reserveOutfit && (
        <div className="space-y-3 border-t border-border bg-muted/10 p-4">
          <p className="text-base font-medium leading-relaxed text-secondary">Reservation payment method</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={reservationPaymentMethod === "cash"}
              onClick={() => onReservationPaymentMethodChange("cash")}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                reservationPaymentMethod === "cash"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-primary/40 hover:bg-muted/40",
              )}
            >
              Cash on hand
            </button>
            <button
              type="button"
              aria-pressed={reservationPaymentMethod !== "cash"}
              onClick={() => onReservationPaymentMethodChange("qrph")}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                reservationPaymentMethod !== "cash"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-primary/40 hover:bg-muted/40",
              )}
            >
              Online payment
            </button>
          </div>
          {reservationPaymentMethod === "cash" ? (
            <p className="text-base text-secondary/70 leading-relaxed">
              Pay the 50% reservation fee in cash within 24 hours of ordering. Staff will confirm the payment and hold the outfit. The remaining balance is due at pickup.
            </p>
          ) : (
            <OnlineMethodSelector
              method={reservationPaymentMethod}
              onMethodChange={onReservationPaymentMethodChange}
              ariaLabel="Reservation online payment method"
            />
          )}
        </div>
      )}
    </div>
  );
}
