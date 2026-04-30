import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {CheckoutNotesField} from "@/features/user-dashboard/cart/components/CheckoutNotesField";
import {OnlinePaymentFields} from "@/features/user-dashboard/cart/components/OnlinePaymentFields";
import {PaymentTypeSelector} from "@/features/user-dashboard/cart/components/PaymentTypeSelector";
import type {
  CheckoutFormState,
  PaymentType,
  UpdateCheckoutField,
} from "@/features/user-dashboard/cart/types/checkout";
import {RentCheckoutFields} from "./RentCheckoutFields";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {placeRentService} from "../services/rentService";
import type {Snapshot} from "../../cart/types/ISnapshot";

type RentCheckoutFormProps = {
  checkoutItems: Snapshot[];
  formState: CheckoutFormState;
  paymentType: PaymentType;
  setPaymentType: (type: PaymentType) => void;
  updateField: UpdateCheckoutField;
};

export function RentCheckoutForm({
  checkoutItems,
  formState,
  paymentType,
  setPaymentType,
  updateField,
}: RentCheckoutFormProps) {
  const {user} = useAuth();

  const handlePlaceRent = async () => {
    if (checkoutItems.length === 0) {
      return;
    }

    if (!formState.rentStart || !formState.rentEnd) {
      alert("Please complete the rental dates.");
      return;
    }

    try {
      await placeRentService({
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
        rentStart: new Date(formState.rentStart),
        rentEnd: new Date(formState.rentEnd),
        pickupTime: formState.pickupTime
          ? new Date(formState.pickupTime)
          : undefined,
        returnTime: formState.returnTime
          ? new Date(formState.returnTime)
          : undefined,
      });
    } catch {
      alert("Unable to place rent.");
    }
  };

  return (
    <>
      <Separator />
      <RentCheckoutFields formState={formState} updateField={updateField} />

      <PaymentTypeSelector
        paymentType={paymentType}
        onPaymentTypeChange={setPaymentType}
      />

      {paymentType === "online" && (
        <OnlinePaymentFields formState={formState} updateField={updateField} />
      )}

      <CheckoutNotesField notes={formState.notes} updateField={updateField} />

      <div className="flex justify-end">
        <Button onClick={handlePlaceRent} type="button" size="lg">
          Place Rental
        </Button>
      </div>
    </>
  );
}
