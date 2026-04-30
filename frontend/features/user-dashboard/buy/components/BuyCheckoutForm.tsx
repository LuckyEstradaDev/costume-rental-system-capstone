import {Button} from "@/components/ui/button";
import {CheckoutNotesField} from "@/features/user-dashboard/cart/components/CheckoutNotesField";
import {OnlinePaymentFields} from "@/features/user-dashboard/cart/components/OnlinePaymentFields";
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
  const {user} = useAuth();

  const handlePlaceOrder = async () => {
    if (checkoutItems.length === 0) {
      return;
    }

    try {
      await placeOrderService({
        userID: user?._id || "",
        items: checkoutItems,
        totalAmount: checkoutItems.reduce((sum, item) => {
          return sum + (Number(item.price) || 0) * (item.quantity || 1);
        }, 0),
        status: "pending",
        payment: {
          method: paymentType,
          transactionId: formState.transactionId,
          paidAt: paymentType === "online" ? new Date() : undefined,
        },
      });
    } catch {
      alert("Unable to place order.");
    }
  };

  return (
    <>
      <PaymentTypeSelector
        paymentType={paymentType}
        onPaymentTypeChange={setPaymentType}
      />

      {paymentType === "online" && (
        <OnlinePaymentFields formState={formState} updateField={updateField} />
      )}

      <CheckoutNotesField notes={formState.notes} updateField={updateField} />

      <div className="flex justify-end">
        <Button onClick={handlePlaceOrder} type="button" size="lg">
          Place Order
        </Button>
      </div>
    </>
  );
}
