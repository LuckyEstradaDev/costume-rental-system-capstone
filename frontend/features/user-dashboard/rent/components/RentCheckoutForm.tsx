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

type RentCheckoutFormProps = {
  formState: CheckoutFormState;
  paymentType: PaymentType;
  setPaymentType: (type: PaymentType) => void;
  updateField: UpdateCheckoutField;
};

export function RentCheckoutForm({
  formState,
  paymentType,
  setPaymentType,
  updateField,
}: RentCheckoutFormProps) {
  return (
    <>
      <Separator />
      <RentCheckoutFields formState={formState} updateField={updateField} />

      <PaymentTypeSelector
        paymentType={paymentType}
        onPaymentTypeChange={setPaymentType}
      />

      {paymentType === "online" && (
        <OnlinePaymentFields
          formState={formState}
          updateField={updateField}
        />
      )}

      <CheckoutNotesField notes={formState.notes} updateField={updateField} />

      <div className="flex justify-end">
        <Button type="button" size="lg">
          Place Rental
        </Button>
      </div>
    </>
  );
}
