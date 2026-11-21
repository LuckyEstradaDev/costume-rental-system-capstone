"use client";

import {Alert} from "@/components/ui/alert";
import {Card} from "@/components/ui/card";
import Image from "next/image";
import {getColorValue} from "@/features/admin-dashboard/inventory-tab/constants/constants";
import {
  calculateReservationAmount,
  formatCurrency,
  getRemainingBalance,
} from "@/lib/formatters";
import {getPackageImageSrc} from "@/lib/package-identity";
import type {IPackageCartItem} from "../../package/types/IPackageCartItem";
import type {Snapshot} from "../types/ISnapshot";
import type {CheckoutMode, ReservationPaymentMethod} from "../types/checkout";
import {PackageItemRow} from "./PackageCartItem";
import {OutfitBranchBadge} from "@/features/reusable/OutfitBranchBadge";

type CheckoutItem = Snapshot | IPackageCartItem;

type CheckoutSummaryProps = {
  items: CheckoutItem[];
  checkoutMode: CheckoutMode;
  reserveOutfit: boolean;
  reservationPaymentMethod: ReservationPaymentMethod;
  subtotal: number;
  total: number;
};

export function CheckoutSummary({
  items,
  checkoutMode,
  reserveOutfit,
  reservationPaymentMethod,
  subtotal,
  total,
}: CheckoutSummaryProps) {
  const isRent = checkoutMode === "rent";
  const isReservation = reserveOutfit;
  const isCashReservation = isReservation && reservationPaymentMethod === "cash";
  const reservationAmount = isReservation
    ? calculateReservationAmount(total)
    : 0;
  const remainingBalance = isReservation
    ? getRemainingBalance(total, reservationAmount)
    : total;

  const packages = items.filter(isPackage);
  const hasPackages = packages.length > 0;
  const singleItems = items.filter(isSnapshot);

  return (
    <Card className="h-fit gap-0 rounded-lg border-border/50 bg-background p-5 md:p-6">
      <h2 className="mb-5 text-xl font-semibold text-primary md:text-2xl">
        Checkout summary
      </h2>
      <div className="min-w-0 space-y-5">
        <div className="min-w-0 space-y-2">
          {!hasPackages && singleItems.length > 0 && (
            <div className="flex items-center justify-between gap-3 text-sm font-medium text-secondary">
              <span>Item</span>
              <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                <span className="w-7 text-right">Qty</span>
                <span className="w-20 text-right sm:w-24">Price</span>
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
                          <OutfitBranchBadge branch={item.branch} className="mt-0.5" />
                          <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{item.size || "One Size"}</span>
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
                      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                        <span className="w-7 text-right text-sm tabular-nums text-secondary">
                          {item.quantity || 1}
                        </span>
                        <span className="w-20 text-right text-sm font-medium tabular-nums text-foreground sm:w-24">
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

        <div className="space-y-4 border-t border-border/60 pt-4">
          <div className="ml-auto w-full space-y-3 text-secondary sm:max-w-sm">
            {subtotal !== total && <div className="flex justify-between gap-3 text-sm">
              <span>
                Subtotal
              </span>
              <span className="font-medium tabular-nums">
                {formatCurrency(subtotal)}
              </span>
            </div>}
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="text-sm font-medium">
                Total
              </span>
              <span className="text-2xl font-semibold tabular-nums text-primary">
                {formatCurrency(total)}
              </span>
            </div>
            {isReservation && !isCashReservation && (
              <div className="space-y-2 text-sm">
                <div className="flex flex-wrap justify-between gap-x-3">
                  <span>
                    Due now (50%)
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(reservationAmount)}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between gap-x-3">
                  <span>
                    Remaining balance
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(remainingBalance)}
                  </span>
                </div>
              </div>
            )}
            {isCashReservation && (
              <p className="text-sm text-secondary/80">
                Full payment is due at pickup after staff approval.
              </p>
            )}
          </div>
          {isRent && (
            <div className="mt-4">
              <Alert
                title="Overdue rental penalty"
                description="Late returns may incur a penalty, which will be deducted from your security deposit."
                variant="warning"
              />
            </div>
          )}
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
    <li className="space-y-3">
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
      <div className="space-y-2.5">
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
