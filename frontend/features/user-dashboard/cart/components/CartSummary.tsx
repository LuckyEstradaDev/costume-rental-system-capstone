"use client";

import {useRouter} from "next/navigation";
import {CalendarClock, ListChecks, Package, ShoppingBag} from "lucide-react";
import {Alert, useNotification} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {formatCurrency} from "@/lib/formatters";
import {CheckoutModeSelector} from "./CheckoutModeSelector";
import {useCheckoutItems} from "../hooks/useCheckoutItems";
import type {CheckoutMode} from "../types/checkout";
import type {Snapshot} from "../types/ISnapshot";
import type {CartTab} from "./CartTabs";
import {fetchOutfitById} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import type {IPackageSnapshot} from "../../package/types/IPackageSnapshot";

type singleOutfitSummaryProps = {
  items: Snapshot[];
  checkoutMode: CheckoutMode;
  onCheckoutModeChange: (mode: CheckoutMode) => void;
};

export function SingleOutfitSummary({
  items,
  checkoutMode,
  onCheckoutModeChange,
}: singleOutfitSummaryProps) {
  const router = useRouter();
  const {saveCheckoutItems} = useCheckoutItems();
  const hasRentUnavailableItem =
    checkoutMode === "rent" &&
    items.some((item) => !(Number(item.rentalPrice) > 0));
  const {notify} = useNotification();

  const subtotal = items.reduce((sum, item) => {
    const itemPrice = checkoutMode === "rent" ? item.rentalPrice : item.price;

    return sum + (Number(itemPrice) || 0) * (item.quantity || 1);
  }, 0);
  const total = subtotal;
  const selectedCount = items.length;

  const handleProceedToCheckout = async () => {
    if (selectedCount === 0 || hasRentUnavailableItem) {
      return;
    }

    for (const item of items) {
      const {data} = await fetchOutfitById(item.outfitId);

      const variant = data.variants.find(
        (variant: {_id: string}) => variant._id === item.variantId,
      );

      const size = variant?.sizes.find(
        (variantSize: {size: string}) => variantSize.size === item.size,
      );

      const stock = size?.stock ?? 0;

      if (item.quantity > stock) {
        notify({
          title: "Checkout failed",
          description: "Insufficient stock.",
          variant: "error",
        });
        return;
      }
    }

    saveCheckoutItems(items, checkoutMode);
    router.push("/dashboard/cart/checkout");
  };

  return (
    <Card className="sticky top-6 gap-0 rounded-lg border border-border bg-card p-5">
      <div className="flex items-baseline justify-between pb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Order Summary
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {selectedCount > 0
              ? `${selectedCount} selected item${selectedCount === 1 ? "" : "s"}`
              : "Select items to continue"}
          </p>
        </div>
        <span className="text-sm font-semibold text-muted-foreground">
          {selectedCount}
        </span>
      </div>

      <div className="space-y-5 pt-5">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <ListChecks className="size-3.5" />
            Selected items
          </span>
          {selectedCount > 0 ? (
            <ul className="space-y-3">
              {items.map((item, index) => (
                <li
                  key={`${item.outfitId}-${item.variantId}-${item.size}-${item.color}-${index}`}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.category} · Size {item.size} · Color {item.color} ·
                      Qty {item.quantity || 1}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-foreground">
                    {formatCurrency(
                      (Number(
                        checkoutMode === "rent" ? item.rentalPrice : item.price,
                      ) || 0) * (item.quantity || 1),
                    )}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-md border border-dashed px-3 py-5 text-center text-sm text-muted-foreground">
              No checkout items selected.
            </div>
          )}
        </div>

        <CheckoutModeSelector
          checkoutMode={checkoutMode}
          onCheckoutModeChange={onCheckoutModeChange}
        />

        {hasRentUnavailableItem ? (
          <Alert
            title="Rental unavailable"
            description="One or more selected items cannot be rented. Unselect them or choose Buy to continue."
            variant="warning"
          />
        ) : null}

        <div className="space-y-2.5 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 font-semibold text-foreground">
              {checkoutMode === "rent" ? (
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

        <Button
          className="w-full"
          size="lg"
          disabled={selectedCount === 0 || hasRentUnavailableItem}
          onClick={handleProceedToCheckout}
        >
          <ShoppingBag className="size-4" />
          Proceed to Checkout
        </Button>

        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground"
          size="sm"
          onClick={() => router.push("/dashboard/browse")}
        >
          Continue Shopping
        </Button>
      </div>
    </Card>
  );
}

type CartSummaryProps = {
  activeTab: CartTab;
  items: (Snapshot | IPackageSnapshot)[];
  checkoutMode: CheckoutMode;
  onCheckoutModeChange: (mode: CheckoutMode) => void;
};

function packagePrice(pkg: IPackageSnapshot, mode: CheckoutMode) {
  return Number(
    mode === "rent" ? (pkg.rentalTotal ?? 0) : (pkg.purchaseTotal ?? 0),
  );
}

function PackageSummary({
  packages,
  checkoutMode,
  onCheckoutModeChange,
}: {
  packages: IPackageSnapshot[];
  checkoutMode: CheckoutMode;
  onCheckoutModeChange: (mode: CheckoutMode) => void;
}) {
  const router = useRouter();
  const {saveCheckoutPackages} = useCheckoutItems();
  const isRent = checkoutMode === "rent";

  const hasUnavailableItem = packages.some((pkg) =>
    isRent ? pkg.mode === "purchase" : pkg.mode === "rental",
  );

  const subtotal = packages.reduce(
    (sum, pkg) => sum + packagePrice(pkg, checkoutMode),
    0,
  );
  const total = subtotal;
  const selectedCount = packages.length;

  const handleProceedToCheckout = async () => {
    if (selectedCount === 0 || hasUnavailableItem) {
      return;
    }

    saveCheckoutPackages(packages, checkoutMode);
    router.push("/dashboard/cart/checkout");
  };

  return (
    <Card className="sticky top-6 gap-0 rounded-lg border border-border bg-card p-5">
      <div className="flex items-baseline justify-between pb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Order Summary
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {selectedCount > 0
              ? `${selectedCount} selected package${selectedCount === 1 ? "" : "s"}`
              : "Select packages to continue"}
          </p>
        </div>
        <span className="text-sm font-semibold text-muted-foreground">
          {selectedCount}
        </span>
      </div>

      <div className="space-y-5 pt-5">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <Package className="size-3.5" />
            Selected packages
          </span>
          {selectedCount > 0 ? (
            <ul className="space-y-3">
              {packages.map((pkg) => {
                const pieceCount = pkg.items.reduce(
                  (sum, item) => sum + item.quantity,
                  0,
                );

                return (
                  <li
                    key={pkg.packageId}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {pkg.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {pieceCount} piece
                        {pieceCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-foreground">
                      {formatCurrency(packagePrice(pkg, checkoutMode))}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-md border border-dashed px-3 py-5 text-center text-sm text-muted-foreground">
              No checkout packages selected.
            </div>
          )}
        </div>

        <CheckoutModeSelector
          checkoutMode={checkoutMode}
          onCheckoutModeChange={onCheckoutModeChange}
        />

        {hasUnavailableItem ? (
          <Alert
            title={isRent ? "Rental unavailable" : "Purchase unavailable"}
            description={
              isRent
                ? "One or more selected packages cannot be rented. Unselect them or choose Buy to continue."
                : "One or more selected packages cannot be purchased. Unselect them or choose Rent to continue."
            }
            variant="warning"
          />
        ) : null}
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

        <Button
          className="w-full"
          size="lg"
          disabled={packages.length <= 0 || hasUnavailableItem}
          onClick={handleProceedToCheckout}
        >
          <Package className="size-4" />
          Proceed to Checkout
        </Button>

        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground"
          size="sm"
          onClick={() => router.push("/dashboard/browse")}
        >
          Continue Shopping
        </Button>
      </div>
    </Card>
  );
}

const isSnapshot = (item: Snapshot | IPackageSnapshot): item is Snapshot =>
  "outfitId" in item;

const isPackage = (
  item: Snapshot | IPackageSnapshot,
): item is IPackageSnapshot => "packageId" in item;

export function CartSummary({
  activeTab,
  items,
  checkoutMode,
  onCheckoutModeChange,
}: CartSummaryProps) {
  if (activeTab === "packages") {
    return (
      <PackageSummary
        packages={items.filter(isPackage)}
        checkoutMode={checkoutMode}
        onCheckoutModeChange={onCheckoutModeChange}
      />
    );
  }

  return (
    <SingleOutfitSummary
      items={items.filter(isSnapshot)}
      checkoutMode={checkoutMode}
      onCheckoutModeChange={onCheckoutModeChange}
    />
  );
}
