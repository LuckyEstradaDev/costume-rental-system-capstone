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
import {BuyPaymentDialog} from "./BuyPaymentDialog";

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
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = checkoutItems.reduce((sum, item) => {
    return sum + (Number(item.price) || 0) * (item.quantity || 1);
  }, 0);

  const paymentMethod =
    paymentType === "online"
      ? formState.onlinePaymentMethod.trim() || "gcash"
      : "cash";

  const submitOrder = async () => {
    if (checkoutItems.length === 0) {
      return;
    }

    if (!user?._id) {
      alert("Please log in before placing an order.");
      return;
    }

    const transactionId = formState.transactionId.trim();

    setIsSubmitting(true);

    try {
      await placeOrderService({
        userID: user._id,
        items: checkoutItems,
        type: "buy",
        totalAmount,
        status: "pending",
        payment: {
          method: paymentMethod,
          transactionId: transactionId || undefined,
          paidAt: paymentType === "online" ? new Date() : undefined,
        },
      });

      setIsPaymentDialogOpen(false);
      router.push("/dashboard/orders");
    } catch {
      alert("Unable to place order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentType === "online") {
      setIsPaymentDialogOpen(true);
      return;
    }

    await submitOrder();
  };

  return (
    <>
      <PaymentTypeSelector
        paymentType={paymentType}
        onPaymentTypeChange={setPaymentType}
      />

      <CheckoutNotesField notes={formState.notes} updateField={updateField} />

      <div className="flex justify-end">
        <Button onClick={handlePlaceOrder} type="button" size="lg">
          {paymentType === "online" ? "Continue to payment" : "Place Order"}
        </Button>
      </div>

      <BuyPaymentDialog
        open={isPaymentDialogOpen}
        paymentMethod={formState.onlinePaymentMethod}
        transactionId={formState.transactionId}
        totalAmount={totalAmount}
        onOpenChange={setIsPaymentDialogOpen}
        onPaymentMethodChange={(method) =>
          updateField("onlinePaymentMethod", method)
        }
        onTransactionIdChange={(value) => updateField("transactionId", value)}
        onConfirmPayment={submitOrder}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
