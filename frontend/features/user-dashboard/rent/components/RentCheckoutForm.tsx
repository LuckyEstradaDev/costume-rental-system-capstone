"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {CheckoutNotesField} from "@/features/user-dashboard/cart/components/CheckoutNotesField";
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
  const router = useRouter();
  const {user} = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceRent = async () => {
    if (checkoutItems.length === 0) {
      return;
    }

    const rentalDays = Number(formState.rentalDays);

    if (!Number.isInteger(rentalDays) || rentalDays < 1) {
      alert("Please enter how many days you would like to rent.");
      return;
    }

    setIsSubmitting(true);

    try {
      await placeRentService({
        userID: user?._id || "",
        items: checkoutItems,
        type: "rent",
        totalAmount: checkoutItems.reduce((sum, item) => {
          return sum + (Number(item.price) || 0) * (item.quantity || 1);
        }, 0),
        status: "pending",
        paymentMethod: paymentType,
        rentalDays,
        returnTime: formState.returnTime
          ? new Date(formState.returnTime)
          : undefined,
      });

      router.push("/dashboard/orders");
    } catch {
      alert("Unable to place rent.");
    } finally {
      setIsSubmitting(false);
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

      <CheckoutNotesField notes={formState.notes} updateField={updateField} />

      <div className="flex justify-end">
        <Button
          onClick={handlePlaceRent}
          type="button"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Placing rental…" : "Place Rental"}
        </Button>
      </div>
    </>
  );
}
