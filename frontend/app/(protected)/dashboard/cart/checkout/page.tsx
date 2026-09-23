"use client";

import {useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {ArrowLeft, CreditCard, Package} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {fetchOutfitById} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {BuyCheckoutForm} from "@/features/user-dashboard/buy/components/BuyCheckoutForm";
import {PackageCheckoutForm} from "@/features/user-dashboard/buy/components/PackageCheckoutForm";
import {CheckoutSummary} from "@/features/user-dashboard/cart/components/CheckoutSummary";
import {useCheckoutItems} from "@/features/user-dashboard/cart/hooks/useCheckoutItems";
import type {Snapshot} from "@/features/user-dashboard/cart/types/ISnapshot";
import type {
  CheckoutFormState,
  PaymentType,
} from "@/features/user-dashboard/cart/types/checkout";
import type {IPackageCartItem} from "@/features/user-dashboard/package/types/IPackageCartItem";
import {PackageRentCheckoutForm} from "@/features/user-dashboard/rent/components/PackageRentCheckoutForm";
import {RentCheckoutForm} from "@/features/user-dashboard/rent/components/RentCheckoutForm";
import {useQueries} from "@tanstack/react-query";

function packagePrice(pkg: IPackageCartItem, mode: "rent" | "purchase") {
  return Number(mode === "rent" ? pkg.rentalTotal ?? 0 : pkg.purchaseTotal ?? 0);
}

export default function CheckoutPage() {
  const router = useRouter();
  const {checkoutItems, checkoutPackages, checkoutMode} = useCheckoutItems();
  const [paymentType, setPaymentType] = useState<PaymentType>("cash");
  const [formState, setFormState] = useState<CheckoutFormState>({
    onlinePaymentMethod: "",
    transactionId: "",
    notes: "",
    rentalDays: "1",
    returnTime: "",
  });
  const isRent = checkoutMode === "rent";
  const hasPackages = checkoutPackages.length > 0;

  const uniqueOutfitIds = [
    ...new Set(checkoutItems.map((item) => item.outfitId).filter(Boolean)),
  ];
  const priceQueries = useQueries({
    queries: uniqueOutfitIds.map((outfitId) => ({
      queryKey: ["outfit", outfitId],
      queryFn: () => fetchOutfitById(outfitId),
    })),
  });
  const outfitPricesById = Object.fromEntries(
    uniqueOutfitIds.map((outfitId, index) => {
      const outfit = priceQueries[index]?.data?.data;
      return [
        outfitId,
        {price: outfit?.price, rentalPrice: outfit?.rentalPrice},
      ];
    }),
  );

  const pricedCheckoutItems = useMemo<Snapshot[]>(() => {
    
    
    if (checkoutItems.length > 0) {
      return checkoutItems.map((item) => {
      const outfitPrices = outfitPricesById[item.outfitId];
      const resolvedPrice =
        isRent
          ? Number(outfitPrices?.rentalPrice ?? item.rentalPrice)
          : Number(outfitPrices?.price ?? item.price);

      return {
        ...item,
        price: Number.isFinite(resolvedPrice) ? resolvedPrice : item.price,
      };
    });
    } else if(checkoutPackages.length > 0) {
      return checkoutPackages.flatMap((pkg) => pkg.items.map((item) => {
        const outfitPrices = outfitPricesById[item.outfitId];
        const resolvedPrice =
          isRent
            ? Number(outfitPrices?.rentalPrice ?? item.rentalPrice)
            : Number(outfitPrices?.price ?? item.price);

        return {
          ...item,
          price: Number.isFinite(resolvedPrice) ? resolvedPrice : item.price,
        };
      }));
    } else {
      return []
    }
  }, [checkoutItems, checkoutPackages, isRent, outfitPricesById]);

  const subtotal = hasPackages
    ? checkoutPackages.reduce(
        (sum, pkg) => sum + packagePrice(pkg, checkoutMode),
        0,
      )
    : pricedCheckoutItems.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
        0,
      );
  const total = subtotal;

  const updateField = (field: string, value: string) => {
    setFormState((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const checkoutMaterials = hasPackages
    ? checkoutPackages
    : pricedCheckoutItems;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 pb-6">
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/cart")}
          >
            <ArrowLeft className="size-4" />
            Back to cart
          </Button>
        </div>
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
            <CreditCard className="size-6 text-foreground" />
            Checkout
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter the transaction details for your selected checkout type.
          </p>
        </div>
      </div>

      {checkoutMaterials.length === 0 ? (
        <Card className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-6 py-16 text-center">
          <Package className="mb-4 size-9 text-muted-foreground" />
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            No checkout items selected
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Choose items from your cart before continuing to checkout.
          </p>
          <Button className="mt-6" onClick={() => router.push("/dashboard/cart")}>
            Go to cart
          </Button>
        </Card>
      ) : (
        <div className="grid w-full grid-cols-1 gap-6">
          <CheckoutSummary
            items={checkoutMaterials}
            checkoutMode={checkoutMode}
            paymentType={paymentType}
            onlinePaymentMethod={formState.onlinePaymentMethod}
            subtotal={subtotal}
            total={total}
          />

          <Card className="gap-0 overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-baseline justify-between px-5 py-4">
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Transaction details
              </h2>
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {hasPackages ? "Package · " : ""}
                {isRent ? "Rental" : "Purchase"}
              </span>
            </div>
            <div className="space-y-6 p-5">
              {hasPackages ? (
                isRent ? (
                  <PackageRentCheckoutForm
                    packages={checkoutPackages}
                    formState={formState}
                    paymentType={paymentType}
                    setPaymentType={setPaymentType}
                    updateField={updateField}
                  />
                ) : (
                  <PackageCheckoutForm
                    packages={checkoutPackages}
                    formState={formState}
                    paymentType={paymentType}
                    setPaymentType={setPaymentType}
                    updateField={updateField}
                  />
                )
              ) : isRent ? (
                <RentCheckoutForm
                  checkoutItems={pricedCheckoutItems}
                  formState={formState}
                  paymentType={paymentType}
                  setPaymentType={setPaymentType}
                  updateField={updateField}
                />
              ) : (
                <BuyCheckoutForm
                  checkoutItems={pricedCheckoutItems}
                  formState={formState}
                  paymentType={paymentType}
                  setPaymentType={setPaymentType}
                  updateField={updateField}
                />
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}