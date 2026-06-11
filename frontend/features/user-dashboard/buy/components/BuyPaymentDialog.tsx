"use client";

import {Landmark, Smartphone, QrCode, ScanLine} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {fetchStripeSession} from "@/features/user-dashboard/checkout/services/services";
import {
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import {useState, useEffect} from "react";
import {OrderTrackingItem} from "../../orders/types/IOrderTracking";
import {useAuth} from "@/features/auth/hooks/useAuth";

type BuyPaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderTrackingItem;
  isSubmitting: boolean;
};

export function BuyPaymentDialog({
  open,
  order,
  onOpenChange,
  isSubmitting,
}: BuyPaymentDialogProps) {
  const checkoutState = useCheckoutElements();
  const {user} = useAuth();

  const handleOnlinePayment = async () => {
    try {
      if (checkoutState.type === "loading") {
        return;
      }

      if (checkoutState.type === "error") {
        console.error(checkoutState.error.message);
        return;
      }

      // TypeScript now knows we're in the success state
      const {checkout} = checkoutState;

      const result = await checkout.confirm({
        email: user!.email,
      });

      if (result.type === "error") {
        console.error(result.error.message);
        return;
      }

      console.log("Payment successful");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-x-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <QrCode className="size-5 text-muted-foreground" />
            <DialogTitle>Ready to pay</DialogTitle>
          </div>
          <DialogDescription>
            Choose a payment method and confirm your payment details to place
            the order.
          </DialogDescription>
        </DialogHeader>

        <div className="flex w-full">
          <PaymentElement className="w-full"></PaymentElement>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            onClick={handleOnlinePayment}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Confirm payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
