"use client";

import {buildOrderPath} from "@/lib/reference-path";
import {useState, type ReactNode} from "react";
import {useRouter} from "next/navigation";
import {useQueryClient} from "@tanstack/react-query";
import {CreditCard, Package} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useNotification} from "@/components/ui/alert";
import {CheckoutPoliciesDialog} from "@/features/user-dashboard/cart/components/CheckoutPoliciesDialog";
import {CheckoutNotesField} from "@/features/user-dashboard/cart/components/CheckoutNotesField";
import {CheckoutSection} from "@/features/user-dashboard/cart/components/CheckoutSection";
import {PaymentTypeSelector} from "@/features/user-dashboard/cart/components/PaymentTypeSelector";
import {ReserveOutfitSelector} from "@/features/user-dashboard/cart/components/ReserveOutfitSelector";
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
  summary: ReactNode;
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
  summary,
}: PackageCheckoutFormProps) {
  const router = useRouter();
  const client = useQueryClient();
  const {user} = useAuth();
  const {notify} = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCashReservation = formState.reserveOutfit && formState.reservationPaymentMethod === "cash";
  const isOnlinePayment = paymentType === "online" && !isCashReservation;
  const continueToPayment = !isCashReservation && (isOnlinePayment || formState.reserveOutfit);

  const submitPackageOrder = async () => {
    if (!user?._id || packages.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const {data} = await placePackageOrderService(
        {userId: user._id, packageItems: packages},
        {
          method: isOnlinePayment ? formState.onlinePaymentMethod : "cash",
          ...(formState.reserveOutfit
            ? {
                reservation: {
                  requested: true,
                  method: formState.reservationPaymentMethod,
                },
              }
            : {}),
        },
        formState.notes.trim() || undefined,
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

      const orderReferenceID = data?.data?.referenceID;

      if (continueToPayment && orderReferenceID) {
        router.push(
          `/dashboard/payment/status?order_id=${encodeURIComponent(
            orderReferenceID,
          )}`,
        );
        return;
      }

      router.push(buildOrderPath(orderReferenceID) || "/dashboard/orders");
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
      <CheckoutSection title="Transaction details">
        <CheckoutNotesField notes={formState.notes} updateField={updateField} />
      </CheckoutSection>

      <CheckoutSection title="Payment">
        <ReserveOutfitSelector
          reserveOutfit={formState.reserveOutfit}
          onReserveOutfitChange={(checked) =>
            updateField("reserveOutfit", checked)
          }
          reservationPaymentMethod={formState.reservationPaymentMethod}
          onReservationPaymentMethodChange={(method) =>
            updateField("reservationPaymentMethod", method)
          }
        />

        <PaymentTypeSelector
          cashOnly={isCashReservation}
          isBalancePayment={formState.reserveOutfit}
          paymentType={paymentType}
          onPaymentTypeChange={setPaymentType}
          onlinePaymentMethod={formState.onlinePaymentMethod}
          onOnlinePaymentMethodChange={(method) =>
            updateField("onlinePaymentMethod", method)
          }
        />
      </CheckoutSection>

      {summary}

      <div className="flex justify-end">
        <CheckoutPoliciesDialog
          action={submitPackageOrder}
          title="Place this package order?"
          description={`This will create one order covering ${packages.length} package${packages.length === 1 ? "" : "s"}.`}
          actionLabel={
            continueToPayment ? "Continue to payment" : "Place Package Order"
          }
        >
          <Button type="button" size="lg" disabled={isSubmitting}>
            {continueToPayment ? (
              <CreditCard className="size-4" />
            ) : (
              <Package className="size-4" />
            )}
            {isSubmitting
              ? "Processing"
              : continueToPayment
                ? "Continue to payment"
                : "Place Package Order"}
          </Button>
        </CheckoutPoliciesDialog>
      </div>
    </>
  );
}
