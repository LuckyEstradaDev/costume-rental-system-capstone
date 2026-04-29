"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {ArrowLeft, CreditCard, Package} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {BuyCheckoutForm} from "@/features/user-dashboard/buy/components/BuyCheckoutForm";
import {CheckoutModeSelector} from "@/features/user-dashboard/cart/components/CheckoutModeSelector";
import {CheckoutSummary} from "@/features/user-dashboard/cart/components/CheckoutSummary";
import {CHECKOUT_ITEMS_STORAGE_KEY} from "@/features/user-dashboard/cart/components/CartSummary";
import type {
  CheckoutFormState,
  CheckoutMode,
  PaymentType,
} from "@/features/user-dashboard/cart/types/checkout";
import type {CartItemData} from "@/features/user-dashboard/cart/utils";
import {RentCheckoutForm} from "@/features/user-dashboard/rent/components/RentCheckoutForm";

const getStoredCheckoutItems = () => {
  if (typeof window === "undefined") {
    return [];
  }

  const storedItems = window.sessionStorage.getItem(CHECKOUT_ITEMS_STORAGE_KEY);

  if (!storedItems) {
    return [];
  }

  try {
    const parsedItems = JSON.parse(storedItems) as CartItemData[];
    return Array.isArray(parsedItems) ? parsedItems : [];
  } catch {
    return [];
  }
};

export default function CheckoutPage() {
  const router = useRouter();
  const [items] = useState<CartItemData[]>(getStoredCheckoutItems);
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>("rent");
  const [paymentType, setPaymentType] = useState<PaymentType>("cash");
  const [formState, setFormState] = useState<CheckoutFormState>({
    onlinePaymentMethod: "",
    transactionId: "",
    notes: "",
    rentStart: "",
    rentEnd: "",
    pickupTime: "",
    returnTime: "",
  });

  const subtotal = items.reduce((sum, item) => {
    return sum + (Number(item.price) || 0) * (item.quantity || 1);
  }, 0);
  const fee = subtotal * 0.1;
  const total = subtotal + fee;
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
            Choose how to proceed and enter the transaction details.
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

      {items.length === 0 ? (
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

            <CheckoutModeSelector
              checkoutMode={checkoutMode}
              onCheckoutModeChange={setCheckoutMode}
            />

            {isRent ? (
              <RentCheckoutForm
                formState={formState}
                paymentType={paymentType}
                setPaymentType={setPaymentType}
                updateField={updateField}
              />
            ) : (
              <BuyCheckoutForm
                formState={formState}
                paymentType={paymentType}
                setPaymentType={setPaymentType}
                updateField={updateField}
              />
            )}
          </Card>

          <CheckoutSummary
            items={items}
            checkoutMode={checkoutMode}
            paymentType={paymentType}
            onlinePaymentMethod={formState.onlinePaymentMethod}
            subtotal={subtotal}
            fee={fee}
            total={total}
          />
        </div>
      )}
    </div>
  );
}
