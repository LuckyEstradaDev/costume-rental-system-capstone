"use client";

import {useId} from "react";
import {CalendarClock} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox";
import {OnlineMethodSelector} from "@/features/user-dashboard/payment/components/OnlineMethodSelector";
import type {OnlinePaymentMethod} from "@/features/user-dashboard/payment/types/IPaymongo";
import {cn} from "@/lib/utils";

type ReserveOutfitSelectorProps = {
  reserveOutfit: boolean;
  onReserveOutfitChange: (checked: boolean) => void;
  reservationPaymentMethod: OnlinePaymentMethod;
  onReservationPaymentMethodChange: (method: OnlinePaymentMethod) => void;
};

export function ReserveOutfitSelector({
  reserveOutfit,
  onReserveOutfitChange,
  reservationPaymentMethod,
  onReservationPaymentMethodChange,
}: ReserveOutfitSelectorProps) {
  const reservationId = useId();

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border transition-colors",
        reserveOutfit ? "bg-background" : "bg-background hover:bg-muted/40",
      )}
    >
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
            <span className="block text-sm font-semibold text-foreground">
              Reserve outfit (50%)
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Pay 50% online now with the method below. Settle the rest in cash
              at pickup or with a second online payment.
            </span>
          </span>
        </label>
      </div>

      {reserveOutfit && (
        <div className="space-y-3 border-t border-border bg-muted/10 p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Reservation online payment method
          </p>
          <OnlineMethodSelector
            method={reservationPaymentMethod}
            onMethodChange={onReservationPaymentMethodChange}
            ariaLabel="Reservation online payment method"
          />
        </div>
      )}
    </div>
  );
}
