"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {useQueryClient} from "@tanstack/react-query";
import {CreditCard, ShoppingBag} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useNotification} from "@/components/ui/alert";
import {AlertDialogComponent} from "@/components/AlertDialog";
import {CheckoutNotesField} from "@/features/user-dashboard/cart/components/CheckoutNotesField";
import {PaymentTypeSelector} from "@/features/user-dashboard/cart/components/PaymentTypeSelector";
import type {
  CheckoutFormState,
  PaymentType,
  UpdateCheckoutField,
} from "@/features/user-dashboard/cart/types/checkout";
import {placeOrderService} from "../services/buyService";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {removeFromCartService} from "@/features/user-dashboard/cart/services/cartService";
import {formatCurrency} from "@/lib/formatters";
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
  const client = useQueryClient();
  const {user} = useAuth();
  const {notify} = useNotification();
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

      // The backend keeps the cart after an order, so remove the ordered items
      // here; failing to clear must not lose the redirect below.
      try {
        await Promise.all(
          checkoutItems.map((item) =>
            removeFromCartService({
              userId: user!._id!,
              variantId: item.variantId,
              size: item.size,
            }),
          ),
        );
      } catch (error) {
        console.error("Failed to clear checked-out cart items:", error);
      }
      client.invalidateQueries({queryKey: ["cart"]});

      const orderReferenceID = data?.data?.referenceID;

      if (paymentType === "online" && orderReferenceID) {
        router.push(
          `/dashboard/payment/status?order_id=${encodeURIComponent(
            orderReferenceID,
          )}`,
        );
        return;
      }

      router.push("/dashboard/orders");
    } catch (error) {
      notify({
        title: "Order failed",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: (error as any)?.response?.data?.message ?? "Unable to place order.",
        variant: "error",
      });
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
        onlinePaymentMethod={formState.onlinePaymentMethod}
        onOnlinePaymentMethodChange={(method) =>
          updateField("onlinePaymentMethod", method)
        }
      />

      <CheckoutNotesField notes={formState.notes} updateField={updateField} />

      <div className="flex justify-end">
        <AlertDialogComponent
          action={submitOrder}
          title="Place this purchase order?"
          description={`This will create a purchase order for ${formatCurrency(totalAmount)}.`}
          actionLabel={
            paymentType === "online" ? "Continue to payment" : "Place Order"
          }
        >
          <Button type="button" size="lg" disabled={isSubmitting || disabled}>
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
        </AlertDialogComponent>
      </div>
    </>
  );
}