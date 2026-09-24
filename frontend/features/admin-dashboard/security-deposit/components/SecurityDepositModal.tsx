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
import {Lock, type LucideIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {ISecurityDeposit} from "../types/ISecurityDeposit";
import {useState} from "react";
import {AdminOrderItem} from "../../orders-tab/types/IAdminOrder";
import {STATUS_OPTIONS, TYPE_OPTIONS} from "../constants";

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
      order.securityDeposit ?? {
        type: "Cash",
        amount: "",
        status: "Pending",
      },
    );

  const handleTypeChange = (type: ISecurityDeposit["type"]) => {
    const base = {
      _id: securityDepositData._id,
      status: securityDepositData.status,
      verificationStatus: securityDepositData.verificationStatus,
      dateSurrendered: securityDepositData.dateSurrendered,
      dateReturned: securityDepositData.dateReturned,
      createdAt: securityDepositData.createdAt,
      updatedAt: securityDepositData.updatedAt,
    };

    if (type === "Cash") {
      setSecurityDepositData({
        ...base,
        type: "Cash",
        amount:
          securityDepositData.type === "Cash"
            ? securityDepositData.amount
            : "",
      });
    } else {
      setSecurityDepositData({
        ...base,
        type,
        IDType:
          securityDepositData.type === "Cash"
            ? ""
            : securityDepositData.IDType,
      });
    }
  };

  return (
    <Dialog
      open={isSecurityDepositDialogOpen}
      onOpenChange={setIsSecurityDepositDialogOpen}
    >
      <DialogContent className="grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-md max-h-[85dvh]">
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

        <div className="min-h-0 space-y-4 overflow-y-auto pr-1 sm:space-y-5">
          <div className="space-y-2">
            <Label>Deposit type</Label>

            <div className="grid grid-cols-2 gap-2">
              {TYPE_OPTIONS.map((option) => {
                const isSelected = securityDepositData.type === option.value;

                return (
                  <ToggleCard
                    key={option.value}
                    icon={option.icon}
                    label={option.label}
                    description={option.description}
                    selected={isSelected}
                    onClick={() => handleTypeChange(option.value)}
                  />
                );
              })}
            </div>
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
            <Label>Status</Label>

            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((option) => {
                const isSelected = securityDepositData.status === option.value;

                return (
                  <ToggleCard
                    key={option.value}
                    icon={option.icon}
                    label={option.label}
                    description={option.description}
                    selected={isSelected}
                    onClick={() =>
                      setSecurityDepositData((prev) => ({
                        ...prev,
                        status: option.value,
                      }))
                    }
                  />
                );
              })}
            </div>
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
            {order.securityDeposit ? "Update deposit" : "Save deposit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ToggleCardProps = {
  icon: LucideIcon;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
};

function ToggleCard({
  icon: Icon,
  label,
  description,
  selected,
  onClick,
}: ToggleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/40"
          : "border-border bg-background hover:border-primary/40 hover:bg-primary/5",
      )}
    >
      <div className="grid size-9 place-items-center rounded-full bg-muted">
        <Icon
          className={cn(
            "size-4.5",
            selected ? "text-primary" : "text-muted-foreground",
          )}
        />
      </div>
      <span className="text-xs font-semibold leading-tight text-foreground">
        {label}
      </span>
      <span className="text-[11px] leading-tight text-muted-foreground">
        {description}
      </span>
    </button>
  );
}
