import type {ComponentProps} from "react";
import {AlertDialogComponent} from "@/components/AlertDialog";
import {CancellationPolicy} from "./CancellationPolicy";
import {RentalInstructions} from "../../rent/components/RentalInstructions";

type CheckoutPoliciesDialogProps = Omit<
  ComponentProps<typeof AlertDialogComponent>,
  "content" | "confirmationLabel"
> & {isRental?: boolean};

export function CheckoutPoliciesDialog({
  isRental = false,
  ...props
}: CheckoutPoliciesDialogProps) {
  return (
    <AlertDialogComponent
      {...props}
      confirmationLabel={isRental
        ? "I have read and agree to the reservation, cancellation, and rental policies, including overdue and damage penalties."
        : "I have read and agree to the reservation and cancellation policies."}
      content={
        <div className="space-y-6">
          <CancellationPolicy />
          {isRental && <RentalInstructions />}
        </div>
      }
    />
  );
}
