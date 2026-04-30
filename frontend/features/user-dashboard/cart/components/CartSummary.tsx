"use client";

import {useRouter} from "next/navigation";
import {Package, ShoppingBag} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {useCheckoutItems} from "../hooks/useCheckoutItems";
import type {Snapshot} from "../types/ISnapshot";

type CartSummaryProps = {
  items: Snapshot[];
};

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

export function CartSummary({items}: CartSummaryProps) {
  const router = useRouter();
  const {saveCheckoutItems} = useCheckoutItems();

  const subtotal = items.reduce((sum, item) => {
    return sum + (Number(item.price) || 0) * (item.quantity || 1);
  }, 0);
  const total = subtotal;
  const selectedCount = items.length;

  const handleProceedToCheckout = () => {
    if (selectedCount === 0) {
      return;
    }

    saveCheckoutItems(items);
    router.push("/dashboard/cart/checkout");
  };

  return (
    <Card className="sticky top-6 space-y-5 p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Cart summary</h2>
        <p className="text-sm text-muted-foreground">
          {selectedCount > 0
            ? `${selectedCount} selected item${selectedCount === 1 ? "" : "s"}`
            : "Select items to continue"}
        </p>
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

      <Button
        className="w-full"
        size="lg"
        disabled={selectedCount === 0}
        onClick={handleProceedToCheckout}
      >
        <ShoppingBag className="size-4" />
        Proceed to Checkout
      </Button>

      <Button
        variant="outline"
        className="w-full"
        size="sm"
        onClick={() => router.push("/dashboard/browse")}
      >
        Continue Shopping
      </Button>
    </Card>
  );
}
