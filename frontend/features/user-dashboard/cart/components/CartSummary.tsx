"use client";

import {useMemo, useState} from "react";
import {
  CalendarClock,
  CreditCard,
  Package,
  ShoppingBag,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Separator} from "@/components/ui/separator";
import {Textarea} from "@/components/ui/textarea";
import {CartItemData} from "../utils";

type CheckoutMode = "rent" | "buy";

type CheckoutFormState = {
  paymentMethod: string;
  transactionId: string;
  notes: string;
  rentStart: string;
  rentEnd: string;
  pickupTime: string;
  returnTime: string;
};

type CartSummaryProps = {
  items: CartItemData[];
};

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

export function CartSummary({items}: CartSummaryProps) {
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>("rent");
  const [formState, setFormState] = useState<CheckoutFormState>({
    paymentMethod: "",
    transactionId: "",
    notes: "",
    rentStart: "",
    rentEnd: "",
    pickupTime: "",
    returnTime: "",
  });

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
        0,
      ),
    [items],
  );
  const fee = subtotal * 0.1;
  const total = subtotal + fee;
  const selectedCount = items.length;
  const isRent = checkoutMode === "rent";
  const feeLabel = isRent ? "Service fee" : "Tax";
  const totalLabel = isRent ? "Estimated total" : "Total";

  const updateField = <K extends keyof CheckoutFormState>(
    field: K,
    value: CheckoutFormState[K],
  ) => {
    setFormState((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  return (
    <Card className="sticky top-6 space-y-5 p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">
          {isRent ? "Rental checkout" : "Order checkout"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {selectedCount > 0
            ? `${selectedCount} selected item${selectedCount === 1 ? "" : "s"}`
            : "Select items to continue"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={isRent ? "default" : "outline"}
          size="sm"
          className="justify-center"
          onClick={() => setCheckoutMode("rent")}
        >
          <CalendarClock className="size-4" />
          Rent
        </Button>
        <Button
          type="button"
          variant={!isRent ? "default" : "outline"}
          size="sm"
          className="justify-center"
          onClick={() => setCheckoutMode("buy")}
        >
          <ShoppingBag className="size-4" />
          Buy
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Package className="size-3.5" />
            Selected items
          </span>
          <span>{selectedCount}</span>
        </div>
        {selectedCount > 0 ? (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={`${item.outfitId}-${item.variantId}-${item.size}-${item.color}-${index}`}
                className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.category} - Size {item.size} - {item.color} - Qty{" "}
                    {item.quantity || 1}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold">
                  {formatCurrency(
                    (Number(item.price) || 0) * (item.quantity || 1),
                  )}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No checkout items selected.
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CreditCard className="size-4 text-muted-foreground" />
          <span>{isRent ? "Rental details" : "Payment details"}</span>
        </div>

        {isRent ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rentStart">Rent start</Label>
              <Input
                id="rentStart"
                type="datetime-local"
                value={formState.rentStart}
                onChange={(event) =>
                  updateField("rentStart", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rentEnd">Rent end</Label>
              <Input
                id="rentEnd"
                type="datetime-local"
                value={formState.rentEnd}
                onChange={(event) => updateField("rentEnd", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupTime">Pickup time</Label>
              <Input
                id="pickupTime"
                type="datetime-local"
                value={formState.pickupTime}
                onChange={(event) =>
                  updateField("pickupTime", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="returnTime">Return time</Label>
              <Input
                id="returnTime"
                type="datetime-local"
                value={formState.returnTime}
                onChange={(event) =>
                  updateField("returnTime", event.target.value)
                }
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment method</Label>
              <Input
                id="paymentMethod"
                type="text"
                value={formState.paymentMethod}
                onChange={(event) =>
                  updateField("paymentMethod", event.target.value)
                }
                placeholder="Cash, GCash, card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input
                id="transactionId"
                type="text"
                value={formState.transactionId}
                onChange={(event) =>
                  updateField("transactionId", event.target.value)
                }
                placeholder="Optional reference number"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formState.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Special instructions"
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{feeLabel}</span>
          <span className="font-medium">{formatCurrency(fee)}</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span className="font-semibold">{totalLabel}</span>
          <span className="text-lg font-bold">{formatCurrency(total)}</span>
        </div>
      </div>

      <Button className="w-full" size="lg" disabled={selectedCount === 0}>
        Proceed to Checkout
      </Button>

      <Button variant="outline" className="w-full" size="sm">
        Continue Shopping
      </Button>
    </Card>
  );
}
