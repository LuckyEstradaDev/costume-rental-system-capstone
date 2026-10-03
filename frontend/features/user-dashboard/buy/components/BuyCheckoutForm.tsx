"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {CreditCard, ShoppingBag} from "lucide-react";
import {Button} from "@/components/ui/button";
import {CheckoutNotesField} from "@/features/user-dashboard/cart/components/CheckoutNotesField";
import {OnlineMethodPicker} from "@/features/user-dashboard/cart/components/OnlineMethodPicker";
import {PaymentTypeSelector} from "@/features/user-dashboard/cart/components/PaymentTypeSelector";
import type {
  CheckoutFormState,
  PaymentType,
  UpdateCheckoutField,
} from "@/features/user-dashboard/cart/types/checkout";
import {placeOrderService} from "../services/buyService";
import {useAuth} from "@/features/auth/hooks/useAuth";
import type {Snapshot} from "../../cart/types/ISnapshot";

type BuyCheckoutFormProps = {
  checkoutItems: Snapshot[];
  formState: CheckoutFormState;
  paymentType: PaymentType;
  setPaymentType: (type: PaymentType) => void;
  updateField: UpdateCheckoutField;
  disabled?: boolean;
};

export function BuyCheckoutForm({
  checkoutItems,
  formState,
  paymentType,
  setPaymentType,
  updateField,
  disabled = false,
}: BuyCheckoutFormProps) {
  const router = useRouter();
  const {user} = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = checkoutItems.reduce((sum, item) => {
    return sum + (Number(item.price) || 0) * (item.quantity || 1);
  }, 0);

  const submitOrder = async () => {
    if (checkoutItems.length === 0 || disabled) {
      return;
    }

    setIsSubmitting(true);

    try {
      const {data} = await placeOrderService(
        {
          userID: user!._id!,
          items: checkoutItems,
          type: "purchase",
          totalAmount,
          status: "pending",
        },
        {method: paymentType === "online" ? formState.onlinePaymentMethod : "cash"},
      );

      const orderID = data?.data?.orderID;

      if (paymentType === "online" && orderID) {
        router.push(`/dashboard/payment/status?order_id=${orderID}`);
        return;
      }

      router.push("/dashboard/orders");
    } catch (error) {
      alert("Unable to place order.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PaymentTypeSelector
        paymentType={paymentType}
        onPaymentTypeChange={setPaymentType}
      />

      {paymentType === "online" && (
        <OnlineMethodPicker
          method={formState.onlinePaymentMethod}
          onMethodChange={(method) => updateField("onlinePaymentMethod", method)}
        />
      )}

      <CheckoutNotesField notes={formState.notes} updateField={updateField} />

      <div className="flex justify-end">
        <Button
          onClick={submitOrder}
          type="button"
          size="lg"
          disabled={isSubmitting || disabled}
        >
          {paymentType === "online" ? (
            <CreditCard className="size-4" />
          ) : (
            <ShoppingBag className="size-4" />
          )}
          {isSubmitting
            ? "Processing"
            : paymentType === "online"
              ? "Continue to payment"
              : "Place Order"}
        </Button>
      </div>
    </>
  );
}