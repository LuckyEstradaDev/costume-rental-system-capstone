"use client";

import {
  CalendarClock,
  HandCoins,
  Package,
  ShoppingBag,
  Smartphone,
} from "lucide-react";
import {Card} from "@/components/ui/card";
import {formatCurrency} from "@/lib/formatters";
import type {IPackageSnapshot} from "../../package/types/IPackageSnapshot";
import type {Snapshot} from "../types/ISnapshot";
import type {CheckoutMode, PaymentType} from "../types/checkout";
import {PackageItemRow} from "./PackageCartItem";

type CheckoutItem = Snapshot | IPackageSnapshot;

type CheckoutSummaryProps = {
  items: CheckoutItem[];
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
  const paymentLabel =
    paymentType === "cash"
      ? "Cash on hand"
      : formatPaymentMethodLabel(onlinePaymentMethod);

  const packages = items.filter(isPackage);
  const hasPackages = packages.length > 0;
  const singleItems = items.filter(isSnapshot);

  return (
    <Card className="h-fit gap-0 rounded-lg border border-border bg-card p-5">
      <div className="flex items-baseline justify-between pb-4">
        <div className="space-y-0.5">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Checkout summary
          </h2>
        </div>
        {hasPackages ? (
          <Package className="size-4 shrink-0 text-primary" />
        ) : isRent ? (
          <CalendarClock className="size-4 shrink-0 text-primary" />
        ) : (
          <ShoppingBag className="size-4 shrink-0 text-primary" />
        )}
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {hasPackages ? (
              <Package className="size-3.5" />
            ) : isRent ? (
              <CalendarClock className="size-3.5" />
            ) : (
              <ShoppingBag className="size-3.5" />
            )}
            {hasPackages
              ? isRent
                ? "Rental packages"
                : "Package order"
              : isRent
                ? "Rental items"
                : "Order items"}
          </span>
          <ul className="space-y-3">
            {hasPackages
              ? packages.map((pkg) => (
                  <PackageSummaryBlock
                    key={pkg.packageId}
                    pkg={pkg}
                    isRent={isRent}
                  />
                ))
              : singleItems.map((item, index) => (
                  <li
                    key={`${item.outfitId}-${item.variantId}-${item.size}-${item.color}-${index}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.category} · Size {item.size} · Color {item.color}{" "}
                        · Qty {item.quantity || 1}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-foreground">
                      {formatCurrency(
                        (Number(item.price) || 0) * (item.quantity || 1),
                      )}
                    </p>
                  </li>
                ))}
          </ul>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {paymentType === "cash" ? (
            <HandCoins className="size-4 shrink-0 text-primary" />
          ) : (
            <Smartphone className="size-4 shrink-0 text-primary" />
          )}
          <span className="text-muted-foreground">Payment</span>
          <span className="ml-auto truncate font-medium text-foreground">
            {paymentLabel}
          </span>
        </div>

        <div className="space-y-2.5 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 font-semibold text-foreground">
              {isRent ? (
                <CalendarClock className="size-4 text-primary" />
              ) : (
                <ShoppingBag className="size-4 text-primary" />
              )}
              Total
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Package block for the checkout summary. Mirrors the cart package card's
 * expanded state: a header row (package name, piece count, total) followed by
 * a flat, always-visible list of its outfit rows — the exact same
 * `PackageItemRow` the cart card renders inside its dropdown.
 */
function PackageSummaryBlock({
  pkg,
  isRent,
}: {
  pkg: IPackageSnapshot;
  isRent: boolean;
}) {
  const pieceCount = pkg.items.reduce((sum, item) => sum + item.quantity, 0);
  const packageTotal = Number(
    isRent ? (pkg.rentalTotal ?? 0) : (pkg.purchaseTotal ?? 0),
  );
  return (
    <li className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {pkg.name}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {pieceCount} piece{pieceCount === 1 ? "" : "s"}
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold text-foreground">
          {formatCurrency(packageTotal)}
        </p>
      </div>

      {/* Outfits inside this package — always visible, same rows as the cart
          card's dropdown. */}
      <div className="space-y-2.5 border-t border-border/60 pt-3">
        {pkg.items.length > 0 ? (
          pkg.items.map((item) => (
            <PackageItemRow
              key={`${item._id}-${item.variantId}-${item.size}`}
              item={item}
              mode={pkg.mode}
              priceMode={isRent ? "rent" : "purchase"}
            />
          ))
        ) : (
          <p className="text-xs text-muted-foreground">
            No items configured for this package.
          </p>
        )}
      </div>
    </li>
  );
}

const isSnapshot = (item: CheckoutItem): item is Snapshot => "outfitId" in item;

const isPackage = (item: CheckoutItem): item is IPackageSnapshot =>
  "packageId" in item;

function formatPaymentMethodLabel(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "Choose a payment method";
  }

  const normalized = trimmed.toLowerCase();

  if (normalized === "gcash") {
    return "GCash";
  }

  if (normalized === "maya") {
    return "Maya";
  }

  return trimmed
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
