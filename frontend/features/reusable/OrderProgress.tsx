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
  | "reserved"
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
  isPaymentRefunded?: boolean;
  cancelledAt?: string | Date | null;
  cancelledFrom?: string | null;
  hasSecurityDeposit?: boolean;
  isReservationRequested?: boolean;
  isReservationConfirmed: boolean;
  compact?: boolean;
  nowrap?: boolean;
  className?: string;
};

export function OrderProgress({
  type,
  status,
  paymentMethod,
  isPaymentPaid,
  isPaymentRefunded = false,
  cancelledAt,
  cancelledFrom,
  hasSecurityDeposit = false,
  isReservationRequested = false,
  isReservationConfirmed,
  compact = false,
  nowrap = false,
  className,
}: OrderProgressProps) {
  const isRent = type === "rent";
  const isCash = paymentMethod === "cash";
  const isCancelled = status === "cancelled";
  const showReservedStep =
    isReservationRequested ||
    status === "reserved" ||
    cancelledFrom === "reserved";
  const readyLabel = isRent ? "Ready for fitting" : "Ready";
  const heldLabel = isRent ? "Active" : "Received";

  const reservedStep: ProgressStep = {
    key: "reserved",
    label: "Reserved",
    icon: LockKeyhole,
  };

  const baseSteps: ProgressStep[] = isRent
    ? [
        {key: "placed", label: "Placed", icon: ShoppingBag},
        ...(showReservedStep ? [reservedStep] : []),
        {key: "ready", label: readyLabel, icon: Store},
        {key: "deposit", label: "Deposit", icon: LockKeyhole},
        {key: "paid", label: "Paid", icon: CreditCard},
        {key: "picked-up", label: heldLabel, icon: PackageCheck},
        {key: "returned", label: "Returned", icon: RotateCcw},
      ]
    : isCash
      ? [
          {key: "placed", label: "Placed", icon: ShoppingBag},
          ...(showReservedStep ? [reservedStep] : []),
          {key: "ready", label: readyLabel, icon: Store},
          {key: "paid", label: "Paid", icon: CreditCard},
          {key: "picked-up", label: heldLabel, icon: PackageCheck},
        ]
      : [
          {key: "placed", label: "Placed", icon: ShoppingBag},
          ...(showReservedStep ? [reservedStep] : []),
          {key: "paid", label: "Paid", icon: CreditCard},
          {key: "ready", label: readyLabel, icon: Store},
          {key: "picked-up", label: heldLabel, icon: PackageCheck},
        ];

  const stepIndex = (key: string) =>
    baseSteps.findIndex((step) => step.key === key);
  const cancelledOn = cancelledAt ? formatReadableDateTime(cancelledAt) : null;
  const isAwaitingReservation = isReservationRequested && !isReservationConfirmed;

  const stoppedStepKey = (() => {
    if (
      isAwaitingReservation &&
      (!cancelledFrom || cancelledFrom === "pending" || cancelledFrom === "reserved")
    ) {
      return "placed";
    }

    switch (cancelledFrom) {
      case "reserved":
        return "reserved";
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
        if (showReservedStep) {
          return "reserved";
        }

        if (hasSecurityDeposit) {
          return "deposit";
        }

        if (isPaymentPaid) {
          return "paid";
        }

        return "placed";
    }
  })();

  const matchedStoppedIndex = stepIndex(stoppedStepKey);
  const stoppedIndex =
    matchedStoppedIndex >= 0 ? matchedStoppedIndex : stepIndex("placed");

  const steps = isCancelled
    ? [
        ...baseSteps.slice(0, stoppedIndex + 1),
        {key: "cancelled", label: "Cancelled", icon: XCircle},
        ...(isPaymentRefunded
          ? [{key: "refunded", label: "Refunded", icon: RotateCcw}]
          : baseSteps.slice(stoppedIndex + 1)),
      ]
    : baseSteps;

  const activeIndex = (() => {
    if (isCancelled) {
      return stoppedIndex;
    }

    if (isAwaitingReservation && (status === "pending" || status === "reserved")) {
      return stepIndex("reserved");
    }

    if (status === "reserved") {
      const reservedIndex = stepIndex("reserved");
      return reservedIndex >= 0
        ? Math.min(reservedIndex + 1, baseSteps.length)
        : 0;
    }

    if (status === "pending" && showReservedStep) {
      return stepIndex("reserved");
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
      return isRent ? stepIndex("returned") : baseSteps.length;
    }

    return baseSteps.length;
  })();

  return (
    <div
      className={cn(
        "w-full",
        nowrap &&
          "overflow-x-auto rounded-md pb-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
      aria-label="Order progress"
      tabIndex={nowrap ? 0 : undefined}
    >
      <div
        className={cn(
          "flex items-start justify-center",
          nowrap ? "w-max min-w-full flex-nowrap" : "flex-wrap",
        )}
      >
        {steps.map((step, index) => {
          const isCancelledStep = isCancelled && step.key === "cancelled";
          const isCompleted =
            step.key === "refunded" ||
            (!(isPaymentRefunded && step.key === "paid") &&
              !(isAwaitingReservation && step.key === "reserved") &&
              (isCancelled ? index <= stoppedIndex : index < activeIndex));
          const isActive = !isCancelled && index === activeIndex;
          const StepIcon = step.icon;

          return (
            <div
              key={step.key}
              className={cn(
                "flex items-start",
                nowrap ? "shrink-0" : "min-w-0",
              )}
            >
              <div
                className={cn(
                  "flex flex-col items-center",
                  nowrap
                    ? compact
                      ? "relative w-7 shrink-0"
                      : "relative w-9 shrink-0"
                    : "min-w-0 gap-1.5",
                )}
              >
                <div
                  className={cn(
                    "grid shrink-0 place-items-center rounded-full border-2 transition-colors",
                    compact ? "size-7" : "size-9",
                    isCompleted &&
                      "border-emerald-500 bg-emerald-500 text-white",
                    isCancelledStep &&
                      "border-destructive bg-destructive text-white",
                    isActive &&
                      "border-primary bg-primary text-primary-foreground",
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
                    nowrap
                      ? compact
                        ? "absolute top-full mt-1.5 w-20 text-[10px]"
                        : "absolute top-full mt-1.5 w-[6.5rem] text-[11px]"
                      : compact
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
                    "h-0.5 shrink-0",
                    nowrap ? (compact ? "mt-[13px]" : "mt-[17px]") : "mt-3.5",
                    compact ? "w-6 sm:w-10" : "w-8 sm:w-20",
                    isCancelled
                      ? index <= stoppedIndex || (isCancelledStep && isPaymentRefunded)
                        ? "bg-emerald-500"
                        : "bg-border"
                      : index < activeIndex
                        ? "bg-emerald-500"
                        : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      {isCancelled && cancelledOn && (
        <p className="mt-10 text-center text-xs text-muted-foreground">
          Cancelled on {cancelledOn}
        </p>
      )}
    </div>
  );
}
