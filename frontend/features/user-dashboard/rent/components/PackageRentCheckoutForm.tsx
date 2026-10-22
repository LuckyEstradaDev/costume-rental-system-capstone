"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {useQueryClient} from "@tanstack/react-query";
import {CalendarClock, CreditCard, Info} from "lucide-react";
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
import type {IPackageCartItem} from "@/features/user-dashboard/package/types/IPackageCartItem";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {RentCheckoutFields} from "./RentCheckoutFields";
import {placePackageRentService} from "../services/rentService";
import {updateProfileService} from "@/features/profile/services/profileService";
import {removeFromPackageCartService} from "@/features/user-dashboard/package/services/packageCartService";
import {toUserAddress} from "@/features/address/utils/formatAddress";
import type {AddressFormValue} from "@/features/address/types";
import {RENTAL_RETURN_WINDOW_DAYS} from "@/lib/rental";
import {formatReadableDate} from "@/lib/formatters";

type PackageRentCheckoutFormProps = {
  packages: IPackageCartItem[];
  formState: CheckoutFormState;
  paymentType: PaymentType;
  setPaymentType: (type: PaymentType) => void;
  updateField: UpdateCheckoutField;
  address: AddressFormValue;
  onAddressChange: (value: AddressFormValue) => void;
};

/**
 * Checkout form for renting the package cart. Submits the whole package cart
 * as one consolidated rent via POST /api/rents/package. The backend flattens
 * all package line items into a single rent with `isPackage: true`.
 */
export function PackageRentCheckoutForm({
  packages,
  formState,
  paymentType,
  setPaymentType,
  updateField,
  address,
  onAddressChange,
}: PackageRentCheckoutFormProps) {
  const router = useRouter();
  const client = useQueryClient();
  const {user, setUser} = useAuth();
  const {notify} = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitPackageRent = async () => {
    if (!user?._id || packages.length === 0) {
      return;
    }

    if (!formState.eventDate) {
      notify({
        title: "Event date required",
        description: "Please select your event date.",
        variant: "warning",
      });
      return;
    }

    const normalizedAddress = toUserAddress(address);

    if (!normalizedAddress) {
      notify({
        title: "Address incomplete",
        description:
          "Please complete your address (region, city/municipality, and barangay).",
        variant: "warning",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (
        JSON.stringify(user?.address ?? null) !==
        JSON.stringify(normalizedAddress)
      ) {
        const updated = await updateProfileService({address: normalizedAddress});
        setUser(updated);
      }

      const {data} = await placePackageRentService({
        packageData: {userId: user._id, packageItems: packages},
        paymentData: {
          method: paymentType === "online" ? formState.onlinePaymentMethod : "cash",
        },
        rentalDays: RENTAL_RETURN_WINDOW_DAYS,
        eventDate: formState.eventDate,
        address: normalizedAddress,
      });

      // The backend keeps the package cart after a rental, so remove the
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
        title: "Rental failed",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: (error as any)?.response?.data?.message ?? "Unable to place package rental.",
        variant: "error",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <RentCheckoutFields
        formState={formState}
        updateField={updateField}
        address={address}
        onAddressChange={onAddressChange}
      />

      <PaymentTypeSelector
        paymentType={paymentType}
        onPaymentTypeChange={setPaymentType}
        onlinePaymentMethod={formState.onlinePaymentMethod}
        onOnlinePaymentMethodChange={(method) =>
          updateField("onlinePaymentMethod", method)
        }
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
          <li>
            Your return date is set to {RENTAL_RETURN_WINDOW_DAYS} days after
            your event date. Please return the outfit by then.
          </li>
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
        <AlertDialogComponent
          action={submitPackageRent}
          title="Place this package rental?"
          description={`This will create one rental covering ${packages.length} package${packages.length === 1 ? "" : "s"}${formState.eventDate ? ` with an event date of ${formatReadableDate(formState.eventDate)}` : ""}.`}
          actionLabel={
            paymentType === "online"
              ? "Continue to payment"
              : "Place Package Rental"
          }
        >
          <Button type="button" size="lg" disabled={isSubmitting}>
            {paymentType === "online" ? (
              <CreditCard className="size-4" />
            ) : (
              <CalendarClock className="size-4" />
            )}
            {isSubmitting
              ? "Processing"
              : paymentType === "online"
                ? "Continue to payment"
                : "Place Package Rental"}
          </Button>
        </AlertDialogComponent>
      </div>
    </>
  );
}