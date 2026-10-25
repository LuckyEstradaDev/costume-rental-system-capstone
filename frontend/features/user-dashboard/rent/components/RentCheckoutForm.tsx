"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {useQueryClient} from "@tanstack/react-query";
import {CalendarClock, CreditCard} from "lucide-react";
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
import {RentCheckoutFields} from "./RentCheckoutFields";
import {RentalInstructions} from "./RentalInstructions";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {placeRentService} from "../services/rentService";
import {updateProfileService} from "@/features/profile/services/profileService";
import {removeFromCartService} from "@/features/user-dashboard/cart/services/cartService";
import {toUserAddress} from "@/features/address/utils/formatAddress";
import type {AddressFormValue} from "@/features/address/types";
import {RENTAL_RETURN_WINDOW_DAYS} from "@/lib/rental";
import {formatReadableDate} from "@/lib/formatters";
import type {Snapshot} from "../../cart/types/ISnapshot";

type RentCheckoutFormProps = {
  checkoutItems: Snapshot[];
  formState: CheckoutFormState;
  paymentType: PaymentType;
  setPaymentType: (type: PaymentType) => void;
  updateField: UpdateCheckoutField;
  address: AddressFormValue;
  onAddressChange: (value: AddressFormValue) => void;
  disabled?: boolean;
};

export function RentCheckoutForm({
  checkoutItems,
  formState,
  paymentType,
  setPaymentType,
  updateField,
  address,
  onAddressChange,
  disabled = false,
}: RentCheckoutFormProps) {
  const router = useRouter();
  const client = useQueryClient();
  const {user, setUser} = useAuth();
  const {notify} = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceRent = async () => {
    if (checkoutItems.length === 0 || disabled) {
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

      const {data} = await placeRentService(
        {
          userID: user?._id || "",
          items: checkoutItems,
          type: "rent",
          totalAmount: checkoutItems.reduce((sum, item) => {
            return sum + (Number(item.price) || 0) * (item.quantity || 1);
          }, 0),
          status: "pending",
          rentalDays: RENTAL_RETURN_WINDOW_DAYS,
          eventDate: formState.eventDate,
          address: normalizedAddress,
        },
        {method: paymentType === "online" ? formState.onlinePaymentMethod : "cash"},
      );

      // The backend keeps the cart after a rental, so remove the ordered
      // items here; failing to clear must not lose the redirect below.
      try {
        await Promise.all(
          checkoutItems.map((item) =>
            removeFromCartService({
              userId: user?._id || "",
              variantId: item.variantId,
              size: item.size,
            }),
          ),
        );
      } catch (error) {
        console.error("Failed to clear checked-out cart items:", error);
      }
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
        description: (error as any)?.response?.data?.message ?? "Unable to place rent.",
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

      <RentalInstructions />
      <div className="flex justify-end">
        <AlertDialogComponent
          action={handlePlaceRent}
          title="Place this rental?"
          description={`This will create a rental order for ${checkoutItems.length} item${checkoutItems.length === 1 ? "" : "s"}${formState.eventDate ? ` with an event date of ${formatReadableDate(formState.eventDate)}` : ""}.`}
          actionLabel={
            paymentType === "online" ? "Continue to payment" : "Place Rental"
          }
        >
          <Button
            type="button"
            size="lg"
            disabled={isSubmitting || disabled}
            title={disabled ? "Package checkout is coming soon" : undefined}
          >
            {paymentType === "online" ? (
              <CreditCard className="size-4" />
            ) : (
              <CalendarClock className="size-4" />
            )}
            {isSubmitting
              ? "Processing"
              : paymentType === "online"
                ? "Continue to payment"
                : "Place Rental"}
          </Button>
        </AlertDialogComponent>
      </div>
    </>
  );
}