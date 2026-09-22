"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Package} from "lucide-react";
import {Button} from "@/components/ui/button";
import {CheckoutNotesField} from "@/features/user-dashboard/cart/components/CheckoutNotesField";
import {PaymentTypeSelector} from "@/features/user-dashboard/cart/components/PaymentTypeSelector";
import type {
  CheckoutFormState,
  PaymentType,
  UpdateCheckoutField,
} from "@/features/user-dashboard/cart/types/checkout";
import {placePackageOrderService} from "../services/buyService";
import {useAuth} from "@/features/auth/hooks/useAuth";
import type {IPackageCartItem} from "@/features/user-dashboard/package/types/IPackageCartItem";

type PackageCheckoutFormProps = {
  packages: IPackageCartItem[];
  formState: CheckoutFormState;
  paymentType: PaymentType;
  setPaymentType: (type: PaymentType) => void;
  updateField: UpdateCheckoutField;
};

/**
 * Checkout form for the package cart. Submits the whole package cart as one
 * consolidated order via POST /api/orders/package — the backend flattens all
 * package line items into a single order with `isPackage: true`.
 */
export function PackageCheckoutForm({
  packages,
  formState,
  paymentType,
  setPaymentType,
  updateField,
}: PackageCheckoutFormProps) {
  const router = useRouter();
  const {user} = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitPackageOrder = async () => {
    if (!user?._id || packages.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await placePackageOrderService(
        {userId: user._id, packageItems: packages},
        {method: paymentType},
      );

      router.push("/dashboard/orders");
    } catch (error) {
      alert("Unable to place package order.");
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
          onClick={submitPackageOrder}
          type="button"
          size="lg"
          disabled={isSubmitting}
        >
          <Package className="size-4" />
          {isSubmitting ? "Processing" : "Place Package Order"}
        </Button>
      </div>
    </>
  );
}