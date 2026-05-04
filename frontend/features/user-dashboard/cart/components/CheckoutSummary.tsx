import {CalendarClock, ShoppingBag} from "lucide-react";
import {Card} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {formatCurrency} from "@/lib/formatters";
import type {Snapshot} from "../types/ISnapshot";
import type {CheckoutMode, PaymentType} from "../types/checkout";

type CheckoutSummaryProps = {
  items: Snapshot[];
  checkoutMode: CheckoutMode;
  paymentType: PaymentType;
  onlinePaymentMethod: string;
  subtotal: number;
  total: number;
};

export function CheckoutSummary({
  items,
  checkoutMode,
  paymentType,
  onlinePaymentMethod,
  subtotal,
  total,
}: CheckoutSummaryProps) {
  const isRent = checkoutMode === "rent";

  return (
    <Card className="h-fit space-y-5 p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Checkout summary</h2>
        <p className="text-sm text-muted-foreground">
          {isRent ? "Rental" : "Purchase"} - {items.length} selected item
          {items.length === 1 ? "" : "s"}
        </p>
        <p className="text-sm text-muted-foreground">
          {paymentType === "cash"
            ? "Cash on hand"
            : onlinePaymentMethod || "Online payment"}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {isRent ? (
            <CalendarClock className="size-3.5" />
          ) : (
            <ShoppingBag className="size-3.5" />
          )}
          {isRent ? "Rental items" : "Order items"}
        </div>
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
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold">{formatCurrency(total)}</span>
        </div>
      </div>
    </Card>
  );
}
