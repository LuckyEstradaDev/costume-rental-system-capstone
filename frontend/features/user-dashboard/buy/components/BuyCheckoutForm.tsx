"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {CheckoutNotesField} from "@/features/user-dashboard/cart/components/CheckoutNotesField";
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
};

export function BuyCheckoutForm({
  checkoutItems,
  formState,
  paymentType,
  setPaymentType,
  updateField,
}: BuyCheckoutFormProps) {
  const router = useRouter();
  const {user} = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = checkoutItems.reduce((sum, item) => {
    return sum + (Number(item.price) || 0) * (item.quantity || 1);
  }, 0);

  const submitOrder = async () => {
    if (checkoutItems.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const {data} = await placeOrderService({
        userID: user!._id!,
        items: checkoutItems,
        type: "purchase",
        totalAmount,
        status: "pending",
        paymentMethod: paymentType,
      });

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

      <CheckoutNotesField notes={formState.notes} updateField={updateField} />

      <div className="flex justify-end">
        <Button
          onClick={submitOrder}
          type="button"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing" : "Place Order"}
        </Button>
      </div>
    </>
  );
}
