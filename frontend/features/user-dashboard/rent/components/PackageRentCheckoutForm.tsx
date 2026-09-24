"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {CalendarClock, Info} from "lucide-react";
import {Button} from "@/components/ui/button";
import {CheckoutNotesField} from "@/features/user-dashboard/cart/components/CheckoutNotesField";
import {PaymentTypeSelector} from "@/features/user-dashboard/cart/components/PaymentTypeSelector";
import type {
  CheckoutFormState,
  PaymentType,
  UpdateCheckoutField,
} from "@/features/user-dashboard/cart/types/checkout";
import type {IPackageCartItem} from "@/features/user-dashboard/package/types/IPackageCartItem";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {RentCheckoutFields} from "./RentCheckoutFields";
import {placePackageRentService} from "../services/rentService";

type PackageRentCheckoutFormProps = {
  packages: IPackageCartItem[];
  formState: CheckoutFormState;
  paymentType: PaymentType;
  setPaymentType: (type: PaymentType) => void;
  updateField: UpdateCheckoutField;
};

/**
 * Checkout form for renting the package cart. Submits the whole package cart
 * as one consolidated rent via POST /api/rents/package — the backend flattens
 * all package line items into a single rent with `isPackage: true`.
 */
export function PackageRentCheckoutForm({
  packages,
  formState,
  paymentType,
  setPaymentType,
  updateField,
}: PackageRentCheckoutFormProps) {
  const router = useRouter();
  const {user} = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitPackageRent = async () => {
    if (!user?._id || packages.length === 0) {
      return;
    }

    const rentalDays = Number(formState.rentalDays);

    if (!Number.isInteger(rentalDays) || rentalDays < 1) {
      alert("Please enter how many days you would like to rent.");
      return;
    }

    setIsSubmitting(true);

    try {
      await placePackageRentService({
        packageData: {userId: user._id, packageItems: packages},
        paymentData: {method: paymentType},
        rentalDays,
      });

      router.push("/dashboard/orders");
    } catch (error) {
      alert("Unable to place package rental.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <RentCheckoutFields formState={formState} updateField={updateField} />

      <PaymentTypeSelector
        paymentType={paymentType}
        onPaymentTypeChange={setPaymentType}
      />

      <CheckoutNotesField notes={formState.notes} updateField={updateField} />

      <div className="rounded-lg border border-border p-4">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <Info className="size-4 text-primary" />
          Rental Instructions
        </span>

        <ul className="mt-2 space-y-1.5 pl-5 text-sm text-muted-foreground list-disc">
          <li>
            Please handle the outfit with care and return it in the same
            condition as when it was picked up.
          </li>
          <li>The rental period starts once the outfit has been picked up.</li>
          <li>
            Late return penalty fees will apply if the outfit is returned after
            the agreed return date or time.
          </li>
          <li>
            Damage fees may apply if the outfit is returned with damage beyond
            normal wear and tear.
          </li>
        </ul>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={submitPackageRent}
          type="button"
          size="lg"
          disabled={isSubmitting}
        >
          <CalendarClock className="size-4" />
          {isSubmitting ? "Placing rental…" : "Place Package Rental"}
        </Button>
      </div>
    </>
  );
}
