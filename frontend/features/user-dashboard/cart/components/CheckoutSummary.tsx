"use client";

import {Card} from "@/components/ui/card";
import Image from "next/image";
import {getColorValue} from "@/features/admin-dashboard/inventory-tab/constants/constants";
import {formatCurrency} from "@/lib/formatters";
import {getPackageImageSrc} from "@/lib/package-identity";
import type {IPackageCartItem} from "../../package/types/IPackageCartItem";
import {
  METHOD_LABELS,
  type OnlinePaymentMethod,
} from "../../payment/types/IPaymongo";
import type {Snapshot} from "../types/ISnapshot";
import type {CheckoutMode, PaymentType} from "../types/checkout";
import {PackageItemRow} from "./PackageCartItem";

type CheckoutItem = Snapshot | IPackageCartItem;

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
          <h2 className="text-[17px] font-semibold tracking-tight text-primary">
            Items
          </h2>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          {!hasPackages && singleItems.length > 0 && (
            <div className="flex items-center justify-between gap-3 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              <span>Item</span>
              <div className="flex shrink-0 items-center gap-4">
                <span className="w-8 text-right">Qty</span>
                <span className="w-24 text-right">Price</span>
              </div>
            </div>
          )}
          <ul className="space-y-3 pt-2">
            {hasPackages
              ? packages.map((pkg) => (
                  <PackageSummaryBlock
                    key={pkg.packageId}
                    pkg={pkg}
                    isRent={isRent}
                  />
                ))
              : singleItems.map((item, index) => {
                  return (
                    <li
                      key={`${item.outfitId}-${item.variantId}-${item.size}-${item.color}-${index}`}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/50">
                          <Image
                            src={
                              item.imageURL ||
                              "/assets/images/landing-page/suit.jpg"
                            }
                            alt={item.name || "Product"}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span>Size {item.size}</span>
                            <span aria-hidden="true">·</span>
                            <span
                              className="size-3 shrink-0 rounded-full border border-foreground/30"
                              style={{
                                backgroundColor: getColorValue(item.color),
                                boxShadow:
                                  "inset 0 0 0 1px rgba(0,0,0,0.12)",
                              }}
                              title={item.color}
                              aria-label={`Color ${item.color}`}
                            />
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-4">
                        <span className="w-8 text-right text-sm text-muted-foreground">
                          {item.quantity || 1}
                        </span>
                        <span className="w-24 text-right text-sm font-medium text-foreground">
                          {formatCurrency(
                            (Number(item.price) || 0) * (item.quantity || 1),
                          )}
                        </span>
                      </div>
                    </li>
                  );
                })}
          </ul>
        </div>

        <div className="space-y-2.5 pt-4">
          <div className="h-0.5 rounded-full bg-primary" />
          <div className="flex justify-between text-sm">
            <span className="text-sm font-medium text-muted-foreground">
              Subtotal
            </span>
            <span className="text-sm font-medium text-foreground">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-foreground">
              Total
            </span>
            <span className="text-lg font-semibold tracking-tight text-foreground">
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
 * a flat, always-visible list of its outfit rows, the exact same
 * `PackageItemRow` the cart card renders inside its dropdown.
 */
function PackageSummaryBlock({
  pkg,
  isRent,
}: {
  pkg: IPackageCartItem;
  isRent: boolean;
}) {
  const pieceCount = pkg.items.reduce((sum, item) => sum + item.quantity, 0);
  const packageTotal = Number(
    isRent ? (pkg.rentalTotal ?? 0) : (pkg.purchaseTotal ?? 0),
  );
  return (
    <li className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3">
      <div className="flex items-center gap-3">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/50">
          <Image
            src={getPackageImageSrc(pkg.imageURL)}
            alt={pkg.name || "Package"}
            fill
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
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

      {/* Outfits inside this package: always visible, same rows as the cart
          card's dropdown. */}
      <div className="space-y-2.5 /60 pt-3">
        {pkg.items.length > 0 ? (
          pkg.items.map((item) => (
            <PackageItemRow
              key={`${item.outfitId}-${item.variantId}-${item.size}`}
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

const isPackage = (item: CheckoutItem): item is IPackageCartItem =>
  "packageId" in item;

function formatPaymentMethodLabel(value: string) {
  const label = METHOD_LABELS[value as OnlinePaymentMethod];

  return label ?? "Choose a payment method";
}
