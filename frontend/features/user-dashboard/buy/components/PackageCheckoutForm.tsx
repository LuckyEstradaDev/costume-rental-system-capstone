"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {useQueryClient} from "@tanstack/react-query";
import {CreditCard, Package} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useNotification} from "@/components/ui/alert";
import {AlertDialogComponent} from "@/components/AlertDialog";
import {CheckoutNotesField} from "@/features/user-dashboard/cart/components/CheckoutNotesField";
import {OnlineMethodPicker} from "@/features/user-dashboard/cart/components/OnlineMethodPicker";
import {PaymentTypeSelector} from "@/features/user-dashboard/cart/components/PaymentTypeSelector";
import type {
  CheckoutFormState,
  PaymentType,
  UpdateCheckoutField,
} from "@/features/user-dashboard/cart/types/checkout";
import {placePackageOrderService} from "../services/buyService";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {removeFromPackageCartService} from "@/features/user-dashboard/package/services/packageCartService";
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
 * consolidated order via POST /api/orders/package. The backend flattens all
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
  const client = useQueryClient();
  const {user} = useAuth();
  const {notify} = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitPackageOrder = async () => {
    if (!user?._id || packages.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const {data} = await placePackageOrderService(
        {userId: user._id, packageItems: packages},
        {method: paymentType === "online" ? formState.onlinePaymentMethod : "cash"},
      );

      // The backend keeps the package cart after an order, so remove the
      // ordered packages here; failing to clear must not lose the redirect.
      try {
        await Promise.all(
          packages
            .filter((pkg) => Boolean(pkg.packageId))
            .map((pkg) =>
              removeFromPackageCartService({
                userId: user._id!,
                packageId: pkg.packageId!,
              }),
            ),
        );
      } catch (error) {
        console.error("Failed to clear ordered packages:", error);
      }
      client.invalidateQueries({queryKey: ["package"]});
      client.invalidateQueries({queryKey: ["cart"]});

      const orderID = data?.data?.orderID;

      if (paymentType === "online" && orderID) {
        router.push(`/dashboard/payment/status?order_id=${orderID}`);
        return;
      }

      router.push("/dashboard/orders");
    } catch (error) {
      notify({
        title: "Order failed",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: (error as any)?.response?.data?.message ?? "Unable to place package order.",
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
      />

      {paymentType === "online" && (
        <OnlineMethodPicker
          method={formState.onlinePaymentMethod}
          onMethodChange={(method) => updateField("onlinePaymentMethod", method)}
        />
      )}

      <CheckoutNotesField notes={formState.notes} updateField={updateField} />

      <div className="flex justify-end">
        <AlertDialogComponent
          action={submitPackageOrder}
          title="Place this package order?"
          description={`This will create one order covering ${packages.length} package${packages.length === 1 ? "" : "s"}.`}
          actionLabel={
            paymentType === "online"
              ? "Continue to payment"
              : "Place Package Order"
          }
        >
          <Button type="button" size="lg" disabled={isSubmitting}>
            {paymentType === "online" ? (
              <CreditCard className="size-4" />
            ) : (
              <Package className="size-4" />
            )}
            {isSubmitting
              ? "Processing"
              : paymentType === "online"
                ? "Continue to payment"
                : "Place Package Order"}
          </Button>
        </AlertDialogComponent>
      </div>
    </>
  );
}