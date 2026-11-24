"use client";

import {useMemo, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {ChevronLeft, Package} from "lucide-react";
import {Button} from "@/components/ui/button";
import {fetchOutfitById} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {normalizeOutfitBranch} from "@/features/admin-dashboard/inventory-tab/constants/constants";
import type {AddressFormValue} from "@/features/address/types";
import {useAuth} from "@/features/auth/hooks/useAuth";
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
  return Number(
    mode === "rent" ? (pkg.rentalTotal ?? 0) : (pkg.purchaseTotal ?? 0),
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const {user} = useAuth();
  const {checkoutItems, checkoutPackages, checkoutMode} = useCheckoutItems();
  const [addressOverride, setAddressOverride] =
    useState<AddressFormValue | null>(null);
  const address: AddressFormValue =
    addressOverride ?? (user?.address ? {...user.address} : {});
  const [paymentType, setPaymentType] = useState<PaymentType>("cash");
  const [formState, setFormState] = useState<CheckoutFormState>({
    onlinePaymentMethod: "qrph",
    reservationPaymentMethod: "qrph",
    reserveOutfit: false,
    transactionId: "",
    notes: "",
    eventDate: "",
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvc: "",
    billingName: "",
    billingEmail: "",
    billingPhone: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingPostalCode: "",
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
      const outfit = priceQueries[index]?.data;
      return [
        outfitId,
        {
          price: outfit?.price,
          rentalPrice: outfit?.rentalPrice,
          branch: normalizeOutfitBranch(outfit?.branch),
        },
      ];
    }),
  );

  const pricedCheckoutItems = useMemo<Snapshot[]>(() => {
    if (checkoutItems.length > 0) {
      return checkoutItems.map((item) => {
        const outfitPrices = outfitPricesById[item.outfitId];
        const resolvedPrice = isRent
          ? Number(outfitPrices?.rentalPrice ?? item.rentalPrice)
          : Number(outfitPrices?.price ?? item.price);

        return {
          ...item,
          price: Number.isFinite(resolvedPrice) ? resolvedPrice : item.price,
          branch: outfitPrices?.branch ?? item.branch,
        };
      });
    } else if (checkoutPackages.length > 0) {
      return checkoutPackages.flatMap((pkg) =>
        pkg.items.map((item) => {
          const outfitPrices = outfitPricesById[item.outfitId];
          const resolvedPrice = isRent
            ? Number(outfitPrices?.rentalPrice ?? item.rentalPrice)
            : Number(outfitPrices?.price ?? item.price);

          return {
            ...item,
            price: Number.isFinite(resolvedPrice) ? resolvedPrice : item.price,
          };
        }),
      );
    } else {
      return [];
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

  const updateField = (field: string, value: string | boolean) => {
    setFormState((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const checkoutMaterials = hasPackages
    ? checkoutPackages
    : pricedCheckoutItems;
  const summary = (
    <CheckoutSummary
      items={checkoutMaterials}
      checkoutMode={checkoutMode}
      reserveOutfit={formState.reserveOutfit}
      reservationPaymentMethod={formState.reservationPaymentMethod}
      finalPaymentMethod={
        paymentType === "cash" ||
        (formState.reserveOutfit && formState.reservationPaymentMethod === "cash")
          ? "cash"
          : formState.onlinePaymentMethod
      }
      subtotal={subtotal}
      total={total}
    />
  );

  return (
    <div className="min-w-0 space-y-8 md:space-y-12">
      <div className="flex flex-col gap-4">
        <div>
          <Link
            href="/dashboard/cart"
            className="inline-flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" /> Back to cart
          </Link>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Checkout
          </h1>
          <p className="mt-1.5 text-base text-muted-foreground leading-relaxed">
            Enter the transaction details for your selected checkout type.
          </p>
        </div>
      </div>

      {checkoutMaterials.length === 0 ? (
        <section className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="mb-4 size-9 text-muted-foreground" />
          <h2 className="text-[17px] font-semibold tracking-tight text-primary">
            No checkout items selected
          </h2>
          <p className="mt-2 max-w-sm text-base text-muted-foreground leading-relaxed">
            Choose items from your cart before continuing to checkout.
          </p>
          <Button
            className="mt-6"
            onClick={() => router.push("/dashboard/cart")}
          >
            Go to cart
          </Button>
        </section>
      ) : (
        <div className="grid w-full min-w-0 grid-cols-1 gap-8 md:gap-12">
          {hasPackages ? (
            isRent ? (
              <PackageRentCheckoutForm
                packages={checkoutPackages}
                formState={formState}
                paymentType={paymentType}
                setPaymentType={setPaymentType}
                updateField={updateField}
                summary={summary}
                address={address}
                onAddressChange={setAddressOverride}
              />
            ) : (
              <PackageCheckoutForm
                packages={checkoutPackages}
                formState={formState}
                paymentType={paymentType}
                setPaymentType={setPaymentType}
                updateField={updateField}
                summary={summary}
              />
            )
          ) : isRent ? (
            <RentCheckoutForm
              checkoutItems={pricedCheckoutItems}
              formState={formState}
              paymentType={paymentType}
              setPaymentType={setPaymentType}
              updateField={updateField}
              summary={summary}
              address={address}
              onAddressChange={setAddressOverride}
            />
          ) : (
            <BuyCheckoutForm
              checkoutItems={pricedCheckoutItems}
              formState={formState}
              paymentType={paymentType}
              setPaymentType={setPaymentType}
              updateField={updateField}
              summary={summary}
            />
          )}
        </div>
      )}
    </div>
  );
}
