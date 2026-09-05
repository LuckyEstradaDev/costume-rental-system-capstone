import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {formatCurrency} from "@/lib/formatters";
import {Button} from "@/components/ui/button";
import {CheckCircle2} from "lucide-react";
import {AdminOrderItem} from "../types/IAdminOrder";

export default function PaymentModal({
  isCashDialogOpen,
  setIsCashDialogOpen,
  cashAmount,
  setCashAmount,
  cashError,
  setCashError,
  handleConfirmCashPayment,
  order,
  cashChange,
  isUpdating,
}: {
  isCashDialogOpen: boolean;
  setIsCashDialogOpen: (open: boolean) => void;
  cashAmount: string;
  setCashAmount: (amount: string) => void;
  cashError: string;
  setCashError: (error: string) => void;
  handleConfirmCashPayment: () => void;
  order: AdminOrderItem;
  cashChange: number;
  isUpdating: boolean;
}) {
  return (
    <Dialog open={isCashDialogOpen} onOpenChange={setIsCashDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cash payment</DialogTitle>
          <DialogDescription>
            Enter the cash received from the customer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-1.5">
            <Label htmlFor="cashAmount">Customer cash</Label>
            <Input
              id="cashAmount"
              type="number"
              min={order.totalAmount}
              step="0.01"
              value={cashAmount}
              onChange={(event) => {
                setCashAmount(event.target.value);
                setCashError("");
              }}
              placeholder={String(order.totalAmount)}
            />
          </div>
          <div className="rounded-lg border p-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
            <div className="mt-1 flex justify-between gap-3">
              <span className="text-muted-foreground">Change</span>
              <span className="font-medium">{formatCurrency(cashChange)}</span>
            </div>
          </div>
          {cashError && <p className="text-sm text-destructive">{cashError}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isUpdating}
            onClick={() => setIsCashDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isUpdating}
            onClick={handleConfirmCashPayment}
          >
            <CheckCircle2 className="size-4" />
            Confirm payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
