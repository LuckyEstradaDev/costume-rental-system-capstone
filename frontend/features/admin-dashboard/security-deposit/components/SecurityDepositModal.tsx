import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Lock} from "lucide-react";
import {ISecurityDeposit} from "../types/ISecurityDeposit";
import {useEffect, useState} from "react";
import ComboboxComponent from "@/components/Combobox";
import {AdminOrderItem} from "../../orders-tab/types/IAdminOrder";

export default function SecurityDepositModal({
  order,
  isSecurityDepositDialogOpen,
  setIsSecurityDepositDialogOpen,
  handleSecurityDepositSubmit,
}: {
  order: AdminOrderItem;
  isSecurityDepositDialogOpen: boolean;
  setIsSecurityDepositDialogOpen: (open: boolean) => void;
  handleSecurityDepositSubmit: (securityDepositData: ISecurityDeposit) => void;
}) {
  const [securityDepositData, setSecurityDepositData] =
    useState<ISecurityDeposit>(
      order.securityDeposit || {
        type: "Cash",
        amount: "0",
        status: "Pending",
      },
    );
  return (
    <Dialog
      open={isSecurityDepositDialogOpen}
      onOpenChange={setIsSecurityDepositDialogOpen}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Lock className="size-5 text-muted-foreground" />
            </div>

            <div>
              <DialogTitle>Security deposit</DialogTitle>
              <DialogDescription>
                Record the security deposit for this rental.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="deposit-type">Deposit type</Label>

            <ComboboxComponent
              placeholder="Select deposit type"
              items={["Cash", "Government ID", "Non-Government ID", "Other"]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(value: any) =>
                setSecurityDepositData((prev) => ({...prev, type: value}))
              }
              value={securityDepositData.type}
            />
          </div>

          {securityDepositData.type === "Cash" ? (
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Cash amount</Label>
              <Input
                id="deposit-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter deposit amount"
                onChange={(e) =>
                  setSecurityDepositData((prev) => {
                    if (prev.type === "Cash") {
                      return {...prev, amount: e.target.value};
                    }
                    return prev;
                  })
                }
                value={securityDepositData.amount ?? ""}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="id-type">ID type</Label>
              <Input
                id="id-type"
                value={securityDepositData.IDType ?? ""}
                placeholder="e.g. Passport, Driver's License"
                onChange={(e) => {
                  setSecurityDepositData((prev) => {
                    if (prev.type !== "Cash") {
                      return {...prev, IDType: e.target.value};
                    }

                    return prev;
                  });
                }}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="deposit-status">Status</Label>
            <ComboboxComponent
              placeholder="Select deposit status"
              items={["Pending", "Held", "Returned", "Forfeited"]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(value: any) =>
                setSecurityDepositData((prev) => ({...prev, status: value}))
              }
              value={securityDepositData.status}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => handleSecurityDepositSubmit(securityDepositData)}
          >
            Save deposit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
