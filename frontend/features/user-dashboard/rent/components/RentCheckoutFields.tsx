"use client";

import {useState} from "react";
import {CalendarDays, Info} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {Label} from "@/components/ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {formatReadableDate} from "@/lib/formatters";
import {getReturnDate} from "@/lib/rental";
import {cn} from "@/lib/utils";
import {AddressFields} from "@/features/address/components/AddressFields";
import type {AddressFormValue} from "@/features/address/types";
import type {
  CheckoutFormState,
  UpdateCheckoutField,
} from "@/features/user-dashboard/cart/types/checkout";

type RentCheckoutFieldsProps = {
  formState: CheckoutFormState;
  updateField: UpdateCheckoutField;
  address: AddressFormValue;
  onAddressChange: (value: AddressFormValue) => void;
};

export function RentCheckoutFields({
  formState,
  updateField,
  address,
  onAddressChange,
}: RentCheckoutFieldsProps) {
  const [open, setOpen] = useState(false);

  const selectedDate = formState.eventDate
    ? new Date(formState.eventDate)
    : undefined;
  const returnDate = selectedDate ? getReturnDate(selectedDate) : undefined;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="eventDate">Event date</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                id="eventDate"
                type="button"
                variant="outline"
                className={cn(
                  "h-10 w-full justify-start gap-2 font-normal",
                  !selectedDate && "text-muted-foreground",
                )}
              >
                <CalendarDays className="size-4" />
                {selectedDate
                  ? formatReadableDate(selectedDate)
                  : "Select your event date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  updateField("eventDate", date ? date.toISOString() : "");
                  setOpen(false);
                }}
                disabled={{before: today}}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-start gap-3">
          <CalendarDays className="mt-0.5 size-6 shrink-0 text-accent" aria-hidden="true" />
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-relaxed text-primary">
              Return by
            </h3>
            <p className="mt-1 text-base leading-relaxed text-secondary/80" aria-live="polite">
              {returnDate
                ? <strong className="font-semibold text-secondary">{formatReadableDate(returnDate)}</strong>
                : "Select an event date to see your return date."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Info className="mt-0.5 size-6 shrink-0 text-accent" aria-hidden="true" />
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-relaxed text-primary">
            Allow time for alterations
          </h3>
          <p className="mt-1 text-base leading-relaxed text-secondary/80">
            We recommend picking up your outfit{" "}
            <strong className="font-semibold text-secondary">
              at least 2 weeks before your event date
            </strong>{" "}
            to allow time for alterations.
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div>
          <p className="text-[17px] font-semibold tracking-tight text-primary">
            Address
          </p>
          <p className="mt-1 text-base leading-relaxed text-secondary/80">
            Region, city or municipality, and barangay are required. We save
            this to your profile for next time.
          </p>
        </div>

        <AddressFields
          value={address}
          onChange={onAddressChange}
          idPrefix="rent-checkout-address"
        />
      </div>
    </div>
  );
}
