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

    const rentalDays = Number(formState.rentalDays);

    if (!Number.isInteger(rentalDays) || rentalDays < 1) {
      alert("Please enter how many days you would like to rent.");
      return;
    }

    try {
      await placeRentService({
        userID: user?._id || "",
        items: checkoutItems,
        type: "rent",
        totalAmount: checkoutItems.reduce((sum, item) => {
          return sum + (Number(item.price) || 0) * (item.quantity || 1);
        }, 0),
        status: "pending",
        payment: {
          method: paymentType,
          transactionId: formState.transactionId,
          paidAt: paymentType === "online" ? new Date() : undefined,
        },
        rentalDays,
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
