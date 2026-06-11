"use client";

import {QrCode} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import {OrderTrackingItem} from "../../orders/types/IOrderTracking";
import {useAuth} from "@/features/auth/hooks/useAuth";

type StripePaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderTrackingItem;
};

export function StripePaymentDialog({
  open,
  order,
  onOpenChange,
}: StripePaymentDialogProps) {
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

      const {checkout} = checkoutState;

      const result = await checkout.confirm({
        email: user!.email,
      });

      if (result.type === "error") {
        console.error(result.error.message);
      }
    } catch (error) {
      console.error(error);
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
            the {order.type === "rent" ? "rental" : "order"}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex w-full">
          <PaymentElement className="w-full" />
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Back
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            onClick={handleOnlinePayment}
          >
            Confirm payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
