"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {ArrowLeft, CreditCard, Package} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {fetchOutfitById} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import type {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {BuyCheckoutForm} from "@/features/user-dashboard/buy/components/BuyCheckoutForm";
import {CheckoutSummary} from "@/features/user-dashboard/cart/components/CheckoutSummary";
import {useCheckoutItems} from "@/features/user-dashboard/cart/hooks/useCheckoutItems";
import type {Snapshot} from "@/features/user-dashboard/cart/types/ISnapshot";
import type {CheckoutFormState, PaymentType} from "@/features/user-dashboard/cart/types/checkout";
import {RentCheckoutForm} from "@/features/user-dashboard/rent/components/RentCheckoutForm";

export default function CheckoutPage() {
  const router = useRouter();
  const {checkoutItems, checkoutMode} = useCheckoutItems();
  const [paymentType, setPaymentType] = useState<PaymentType>("cash");
  const [formState, setFormState] = useState<CheckoutFormState>({
    onlinePaymentMethod: "",
    transactionId: "",
    notes: "",
    rentalDays: "1",
    returnTime: "",
  });
  const [outfitPricesById, setOutfitPricesById] = useState<
    Record<string, Pick<IOutfit, "price" | "rentalPrice">>
  >({});

  useEffect(() => {
    let isActive = true;

    const loadPrices = async () => {
      if (checkoutItems.length === 0) {
        setOutfitPricesById({});
        return;
      }

      const uniqueOutfitIds = [
        ...new Set(checkoutItems.map((item) => item.outfitId).filter(Boolean)),
      ];

      try {
        const entries = await Promise.all(
          uniqueOutfitIds.map(async (outfitId) => {
            try {
              const {data} = await fetchOutfitById(outfitId);
              return [
                outfitId,
                {
                  price: data?.price,
                  rentalPrice: data?.rentalPrice,
                },
              ] as const;
            } catch {
              return [outfitId, {}] as const;
            }
          }),
        );

        if (isActive) {
          setOutfitPricesById(Object.fromEntries(entries));
        }
      } catch {
        if (isActive) {
          setOutfitPricesById({});
        }
      }
    };

    void loadPrices();

    return () => {
      isActive = false;
    };
  }, [checkoutItems]);

  const pricedCheckoutItems = useMemo<Snapshot[]>(() => {
    return checkoutItems.map((item) => {
      const outfitPrices = outfitPricesById[item.outfitId];
      const resolvedPrice =
        checkoutMode === "rent"
          ? Number(outfitPrices?.rentalPrice ?? item.rentalPrice)
          : Number(outfitPrices?.price ?? item.price);

      return {
        ...item,
        price: Number.isFinite(resolvedPrice) ? resolvedPrice : item.price,
      };
    });
  }, [checkoutItems, checkoutMode, outfitPricesById]);

  const subtotal = pricedCheckoutItems.reduce((sum, item) => {
    return sum + (Number(item.price) || 0) * (item.quantity || 1);
  }, 0);
  const total = subtotal;
  const isRent = checkoutMode === "rent";

  const updateField = (field: string, value: string) => {
    setFormState((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="mt-1 text-muted-foreground">
            Enter the transaction details for your selected checkout type.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/cart")}
        >
          <ArrowLeft className="size-4" />
          Back to cart
        </Button>
      </div>

      {checkoutItems.length === 0 ? (
        <Card className="space-y-4 p-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
            <Package className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">
              No checkout items selected
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose items from your cart before continuing to checkout.
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard/cart")}>
            Go to cart
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <Card className="space-y-6 p-6">
            <div className="flex items-center gap-2">
              <CreditCard className="size-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Transaction details</h2>
            </div>

            {isRent ? (
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
          </Card>

          <CheckoutSummary
            items={pricedCheckoutItems}
            checkoutMode={checkoutMode}
            paymentType={paymentType}
            onlinePaymentMethod={formState.onlinePaymentMethod}
            subtotal={subtotal}
            total={total}
          />
        </div>
      )}
    </div>
  );
}
