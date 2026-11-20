import {
  Check,
  CreditCard,
  LockKeyhole,
  PackageCheck,
  RotateCcw,
  ShoppingBag,
  Store,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import {formatReadableDateTime} from "@/lib/formatters";
import {cn} from "@/lib/utils";

type OrderProgressStatus =
  | "pending"
  | "ready"
  | "active"
  | "overdue"
  | "returned"
  | "received"
  | "cancelled";

type ProgressStep = {
  key: string;
  label: string;
  icon: LucideIcon;
};

type OrderProgressProps = {
  type: "purchase" | "rent";
  status: OrderProgressStatus;
  paymentMethod?: string | null;
  isPaymentPaid: boolean;
  cancelledAt?: string | Date | null;
  cancelledFrom?: string | null;
  hasSecurityDeposit?: boolean;
  compact?: boolean;
  className?: string;
};

export function OrderProgress({
  type,
  status,
  paymentMethod,
  isPaymentPaid,
  cancelledAt,
  cancelledFrom,
  hasSecurityDeposit = false,
  compact = false,
  className,
}: OrderProgressProps) {
  const isRent = type === "rent";
  const isCash = paymentMethod === "cash";
  const readyLabel = isRent ? "Ready for fitting" : "Ready";
  const heldLabel = isRent ? "Outfit held by customer" : "Received";

  const steps: ProgressStep[] = isRent
    ? [
        {key: "placed", label: "Placed", icon: ShoppingBag},
        {key: "ready", label: readyLabel, icon: Store},
        {key: "deposit", label: "Deposit", icon: LockKeyhole},
        {key: "paid", label: "Paid", icon: CreditCard},
        {key: "picked-up", label: heldLabel, icon: PackageCheck},
        {key: "returned", label: "Returned", icon: RotateCcw},
      ]
    : isCash
      ? [
          {key: "placed", label: "Placed", icon: ShoppingBag},
          {key: "ready", label: readyLabel, icon: Store},
          {key: "paid", label: "Paid", icon: CreditCard},
          {key: "picked-up", label: heldLabel, icon: PackageCheck},
        ]
      : [
          {key: "placed", label: "Placed", icon: ShoppingBag},
          {key: "paid", label: "Paid", icon: CreditCard},
          {key: "ready", label: readyLabel, icon: Store},
          {key: "picked-up", label: heldLabel, icon: PackageCheck},
        ];

  const stepIndex = (key: string) => steps.findIndex((step) => step.key === key);
  const isCancelled = status === "cancelled";
  const cancelledOn = cancelledAt ? formatReadableDateTime(cancelledAt) : null;

  const cancelledStepKey = (() => {
    switch (cancelledFrom) {
      case "ready":
        return isRent && hasSecurityDeposit
          ? isPaymentPaid
            ? "paid"
            : "deposit"
          : "ready";
      case "active":
      case "overdue":
      case "received":
        return "picked-up";
      case "returned":
        return "returned";
      case "paid":
        return "paid";
      default:
        if (hasSecurityDeposit) {
          return "deposit";
        }

        if (isPaymentPaid) {
          return "paid";
        }

        return "placed";
    }
  })();

  const matchedCancelledStepIndex = stepIndex(cancelledStepKey);
  const cancelledStepIndex =
    matchedCancelledStepIndex >= 0 ? matchedCancelledStepIndex : stepIndex("placed");

  const activeIndex = (() => {
    if (isCancelled) {
      return cancelledStepIndex;
    }

    if (status === "pending") {
      return stepIndex(isRent || isCash ? "ready" : "paid");
    }

    if (status === "ready") {
      if (isRent && !hasSecurityDeposit) {
        return stepIndex("deposit");
      }

      if (!isPaymentPaid) {
        return stepIndex("paid");
      }

      return stepIndex("picked-up");
    }

    if (status === "active" || status === "overdue") {
      return isRent ? stepIndex("returned") : steps.length;
    }

    return steps.length;
  })();

  return (
    <div className={cn("w-full", className)} aria-label="Order progress">
      <div className="flex flex-wrap items-start justify-center">
        {steps.map((step, index) => {
          const isCancelledStep = isCancelled && index === activeIndex;
          const isCompleted = !isCancelledStep && index < activeIndex;
          const isActive = !isCancelled && index === activeIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex min-w-0 items-start">
              <div className="flex min-w-0 flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "grid shrink-0 place-items-center rounded-full border-2 transition-colors",
                    compact ? "size-7" : "size-9",
                    isCompleted && "border-emerald-500 bg-emerald-500 text-white",
                    isCancelledStep &&
                      "border-destructive bg-destructive text-destructive-foreground",
                    isActive && "border-primary bg-primary text-primary-foreground",
                    !isCompleted &&
                      !isCancelledStep &&
                      !isActive &&
                      "border-border bg-background text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <Check className={cn(compact ? "size-3.5" : "size-4")} />
                  ) : isCancelledStep ? (
                    <XCircle className={cn(compact ? "size-3.5" : "size-4")} />
                  ) : (
                    <StepIcon className={cn(compact ? "size-3.5" : "size-4")} />
                  )}
                </div>
                <span
                  className={cn(
                    "text-center font-medium leading-tight",
                    compact
                      ? "max-w-[5rem] text-[10px]"
                      : "max-w-[6.5rem] text-[11px]",
                    isActive && "text-foreground",
                    isCompleted && "text-emerald-600",
                    isCancelledStep && "font-semibold text-destructive",
                    !isCompleted &&
                      !isCancelledStep &&
                      !isActive &&
                      "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={cn(
                    "mt-3.5 h-0.5 shrink-0",
                    compact ? "w-6 sm:w-10" : "w-8 sm:w-20",
                    index < activeIndex ? "bg-emerald-500" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      {isCancelled && cancelledOn && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Cancelled on {cancelledOn}
        </p>
      )}
    </div>
  );
}
