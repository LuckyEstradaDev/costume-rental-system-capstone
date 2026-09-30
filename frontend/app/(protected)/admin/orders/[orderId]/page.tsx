"use client";

import {useState} from "react";
import Image from "next/image";
import {useParams, useRouter} from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Lock,
  Package,
  Pencil,
  Plus,
  Receipt,
  RotateCcw,
  ShoppingBag,
  Undo2,
  User,
  Wallet,
  XCircle,
} from "lucide-react";
import {cn} from "@/lib/utils";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {AdminEmptyState} from "@/features/admin-dashboard/components/AdminEmptyState";
import {AdminPageHeader, AdminPageTitle} from "@/features/admin-dashboard/components/AdminPageHeader";
import {Card} from "@/components/ui/card";
import {
  formatCurrency,
  formatReadableDateTime,
  formatStatusLabel,
} from "@/lib/formatters";
import {getIdFromSlug} from "@/lib/slug";
import {AdminOrderStatusBadge} from "@/features/admin-dashboard/orders-tab/components/AdminOrderStatusBadge";
import {
  fetchAdminOrderByIdService,
  markAdminOrderPaymentPaidService,
  markAdminOrderPaymentRefundedService,
  updateAdminOrderStatusService,
} from "@/features/admin-dashboard/orders-tab/services/adminOrderService";
import type {
  AdminOrderItem,
  AdminOrderStatus,
} from "@/features/admin-dashboard/orders-tab/types/IAdminOrder";
import {getSafeAdminOrderImageSrc} from "@/features/admin-dashboard/orders-tab/utils/image";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import PaymentModal from "@/features/admin-dashboard/orders-tab/components/PaymentModal";
import SecurityDepositModal from "@/features/admin-dashboard/security-deposit/components/SecurityDepositModal";
import {ISecurityDeposit} from "@/features/admin-dashboard/security-deposit/types/ISecurityDeposit";
import {
  STATUS_OPTIONS,
  TYPE_OPTIONS,
} from "@/features/admin-dashboard/security-deposit/constants";
import {updateRentSecurityDepositService} from "@/features/admin-dashboard/security-deposit/services/securityDepositService";
import {useNotification} from "@/components/ui/alert";

const getStatuses = (order: AdminOrderItem) => {
  if (order.type === "rent") {
    if (order.status === "pending") {
      return ["active", "cancelled"] as AdminOrderStatus[];
    }

    if (order.status === "active" || order.status === "overdue") {
      return ["returned"] as AdminOrderStatus[];
    }

    return [] as AdminOrderStatus[];
  }

  if (order.status === "pending") {
    return ["received", "cancelled"] as AdminOrderStatus[];
  }

  return [] as AdminOrderStatus[];
};

const getStatusActionLabel = (status: AdminOrderStatus) => {
  const labels: Record<AdminOrderStatus, string> = {
    pending: "Mark pending",
    received: "Mark received",
    active: "Mark picked up",
    overdue: "Mark overdue",
    returned: "Mark returned",
    cancelled: "Cancel order",
  };

  return labels[status];
};

const getCustomerName = (order: AdminOrderItem) => {
  if (!order.user) {
    return "Unknown customer";
  }

  return `${order.user.firstName} ${order.user.lastName}`;
};

export default function AdminOrderDetailsPage() {
  const client = useQueryClient();
  const router = useRouter();
  const params = useParams<{orderId: string}>();
  const orderId = getIdFromSlug(params.orderId);
  const {notify} = useNotification();

  const {
    data: order = null,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: () => fetchAdminOrderByIdService(orderId),
  });

  const updateAdminOrderStatusMutation = useMutation({
    mutationFn: updateAdminOrderStatusService,
    onSuccess: () => {
      client.invalidateQueries({queryKey: ["admin-order"]});
    },
  });

  const updateRentSecurityDepositMutation = useMutation({
    mutationFn: updateRentSecurityDepositService,
    onSuccess: () => {
      client.invalidateQueries({queryKey: ["admin-order"]});
      notify({
        title: "Security deposit updated",
        description: "The security deposit has been successfully updated.",
        variant: "success",
      });
    },
  });

  const markAdminOrderPaymentPaidMutation = useMutation({
    mutationFn: markAdminOrderPaymentPaidService,
    onSuccess: () => {
      client.invalidateQueries({queryKey: ["admin-order"]});
    },
  });

  const markAdminOrderPaymentRefundedMutation = useMutation({
    mutationFn: markAdminOrderPaymentRefundedService,
    onSuccess: () => {
      client.invalidateQueries({queryKey: ["admin-order"]});
    },
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCashDialogOpen, setIsCashDialogOpen] = useState(false);
  const [cashAmount, setCashAmount] = useState("");
  const [cashError, setCashError] = useState("");
  const [isSecurityDepositDialogOpen, setIsSecurityDepositDialogOpen] =
    useState(false);

  const handleSecurityDepositSubmit = async (
    securityDepositData: ISecurityDeposit,
  ) => {
    if (!order) {
      return;
    }

    if (securityDepositData.type === "Cash") {
      const amount = Number(securityDepositData.amount);
      if (!Number.isFinite(amount) || amount < 0) {
        alert("Deposit amount must be a non-negative number.");
        return;
      }

      securityDepositData = {...securityDepositData, amount: amount};
    }

    await updateRentSecurityDepositMutation.mutateAsync({
      id: order._id,
      securityDepositData,
    });

    setIsSecurityDepositDialogOpen(false);
  };

  const handleStatusChange = async (status: AdminOrderStatus) => {
    if (!order) {
      return;
    }

    setIsUpdating(true);
    setErrorMessage("");

    try {
      await updateAdminOrderStatusMutation.mutateAsync({
        orderId: order._id,
        status,
      });
      // Always preserve the payment data - merge new status data with existing payment
      // Since we're not refetching, manually update the UI state
      // This is a mutation, would ideally use useMutation in a full TanStack setup
    } catch {
      setErrorMessage("Unable to update order status.");
    }

    setIsUpdating(false);
  };

  const handleMarkPaymentPaid = async (
    cash?: number,
    paymentMethod?: string,
  ) => {
    if (!order) {
      return;
    }

    setIsUpdating(true);
    setErrorMessage("");

    try {
      await markAdminOrderPaymentPaidMutation.mutateAsync({
        orderId: order._id,
        method:
          paymentMethod ||
          order.payment?.method ||
          order.paymentMethod ||
          "unknown",
        cash,
      });
      setIsCashDialogOpen(false);
      setCashAmount("");
      setCashError("");
    } catch {
      setErrorMessage("Unable to mark payment as paid.");
    }

    setIsUpdating(false);
  };

  const handleMarkPaymentRefunded = async () => {
    if (!order) {
      return;
    }

    setIsUpdating(true);
    setErrorMessage("");

    try {
      await markAdminOrderPaymentRefundedMutation.mutateAsync({
        id: order._id,
      });
    } catch {
      setErrorMessage("Unable to mark payment as refunded.");
    }

    setIsUpdating(false);
  };

  const handlePaidButtonClick = () => {
    if (order?.status === "cancelled") {
      return;
    }

    if (order?.payment?.method === "cash") {
      setCashAmount("");
      setCashError("");
      setIsCashDialogOpen(true);
      return;
    }

    void handleMarkPaymentPaid();
  };

  const handleConfirmCashPayment = async () => {
    if (!order) {
      return;
    }

    const cash = Number(cashAmount);

    if (!Number.isFinite(cash) || cash < order.totalAmount) {
      setCashError("Cash must be at least the order total.");
      return;
    }

    await handleMarkPaymentPaid(
      cash,
      order.payment?.method || order.paymentMethod || "unknown",
    );
  };

  if (isLoading) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        Loading order...
      </Card>
    );
  }

  if (!order || isError) {
    return (
      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/orders")}
        >
          <ArrowLeft className="size-4" />
          Back to orders
        </Button>
        {/* `min-h-[60vh]` is trimmed to leave room for the button above without
            pushing the empty state off the bottom of a short viewport. */}
        <AdminEmptyState
          className="min-h-[50vh]"
          icon={FileText}
          title="Order not found"
          description={
            errorMessage ||
            "This order may have been removed, or the link is out of date."
          }
        />
      </div>
    );
  }

  const itemCount = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  // Single source of truth for payment status - falls back to paidAt
  // when payment.status hasn't been explicitly set. All paid/refunded
  // checks below use this instead of reading order.payment?.status
  // directly, so purchase and rent orders behave identically.
  const paymentStatus =
    order.payment?.status || (order.payment?.paidAt ? "paid" : "pending");
  const isPaymentPaid = paymentStatus === "paid";
  const isPaymentRefunded = paymentStatus === "refunded";
  const canMarkPaymentPaid = order.status !== "cancelled" && !isPaymentPaid;
  const cashValue = Number(cashAmount);
  const cashChange =
    Number.isFinite(cashValue) && cashValue >= order.totalAmount
      ? cashValue - order.totalAmount
      : 0;

  const isRent = order.type === "rent";

  // Every clickable action in one list so the fixed bar is a single map. Keeping
  // the conditions here rather than inline in the JSX means the bar can hide
  // itself: a received purchase that is already paid has no next step at all.
  const actions: OrderAction[] = [
    ...(isPaymentPaid && order.status === "cancelled"
      ? [
          {
            key: "refund",
            icon: RotateCcw,
            label: "Refund payment",
            destructive: true,
            onClick: handleMarkPaymentRefunded,
          },
        ]
      : []),
    ...(canMarkPaymentPaid
      ? [
          {
            key: "mark-paid",
            icon: CheckCircle2,
            label: "Mark as paid",
            primary: true,
            onClick: handlePaidButtonClick,
          },
        ]
      : []),
    ...getStatuses(order).map((status) => ({
      key: `status-${status}`,
      icon: status === "cancelled" ? XCircle : CheckCircle2,
      label: getStatusActionLabel(status),
      destructive: status === "cancelled",
      disabled: isUpdating || order.status === status,
      onClick: () => handleStatusChange(status),
    })),
    // Security deposits exist only on rentals - RentModel carries the field and
    // OrderModel does not.
    ...(isRent
      ? [
          {
            key: "deposit",
            icon: order.securityDeposit ? Pencil : Plus,
            label: order.securityDeposit ? "Edit deposit" : "Set deposit",
            onClick: () => setIsSecurityDepositDialogOpen(true),
          },
        ]
      : []),
  ];

  return (
    // pb-36 keeps the last card clear of the fixed action bar, which wraps to
    // two rows of 44px buttons on narrow viewports.
    <div
      className={cn(
        "space-y-6",
        actions.length > 0 && "pb-36",
      )}
    >
      {/* Only the title lives in the header. The back button and the reference
          stay in the body: the bar is one row of controls, and this page also
          has a fixed action bar pinned to the bottom, so the header is not the
          place to look for navigation. */}
      <AdminPageHeader
        title={<AdminPageTitle icon={Package}>Order details</AdminPageTitle>}
        description="Status, payment, and rental progress for one order."
        actions={<AdminOrderStatusBadge status={order.status} />}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin/orders")}
        >
          <ArrowLeft />
          Back to orders
        </Button>
        <p className="text-sm text-muted-foreground">{order.referenceID}</p>
      </div>

      {errorMessage && (
        <Card className="p-4 text-destructive">{errorMessage}</Card>
      )}

      <Card className="overflow-hidden border-0 bg-card shadow-sm ring-1 ring-border/60">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-border/50 bg-muted/30 px-5 py-3.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
            <Package className="size-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Order items
          </h3>
          <AdminOrderStatusBadge status={order.status} />
          <span className="text-xs text-muted-foreground">
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </span>
          <div className="ml-auto text-right">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Total
            </p>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
        </div>

        <div className="divide-y divide-border/50">
          {order.items.map((item, index) => {
            const itemTotal = Number(item.price) * item.quantity;

            return (
              <div
                key={`${item.outfitId}-${item.variantId}-${index}`}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div className="flex min-w-0 flex-1 gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/40">
                    <Image
                      src={getSafeAdminOrderImageSrc(item.imageURL)}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.category} - Size {item.size} - {item.color}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty {item.quantity} x {formatCurrency(Number(item.price))}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-left sm:text-right">
                  <p className="text-[11px] text-muted-foreground">
                    Item total
                  </p>
                  <p className="mt-0.5 text-[15px] font-semibold tabular-nums">
                    {formatCurrency(itemTotal)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="overflow-hidden border-0 bg-card shadow-sm ring-1 ring-border/60">
        <div className="flex items-center gap-3 border-b border-border/50 bg-muted/30 px-5 py-3.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
            <Receipt className="size-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Transaction details
          </h3>
        </div>

        <div className="p-5">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <QuickFact
              icon={User}
              label="Customer"
              value={getCustomerName(order)}
            />
            <QuickFact
              icon={order.type === "rent" ? CalendarClock : ShoppingBag}
              label="Type"
              value={order.type === "rent" ? "Rental" : "Purchase"}
            />
            <QuickFact
              icon={CreditCard}
              label="Payment method"
              value={formatStatusLabel(order.payment?.method)}
            />
            <QuickFact
              icon={Wallet}
              label="Payment status"
              value={<PaymentStatusBadge status={paymentStatus} />}
            />
            <QuickFact
              icon={Clock}
              label={order.type === "rent" ? "Placed rent" : "Placed order"}
              value={formatReadableDateTime(order.createdAt)}
            />
            {order.payment?.cash !== undefined && (
              <QuickFact
                icon={Banknote}
                label="Cash"
                value={formatCurrency(order.payment.cash)}
              />
            )}
            {order.payment?.change !== undefined && (
              <QuickFact
                icon={Banknote}
                label="Change"
                value={formatCurrency(order.payment.change)}
              />
            )}
            {order.type === "rent" && (
              <>
                <QuickFact
                  icon={CalendarDays}
                  label="Rental duration"
                  value={
                    order.rentalDays ? `${order.rentalDays} day(s)` : "Not set"
                  }
                />
                <QuickFact
                  icon={Undo2}
                  label="Pickup time"
                  value={formatReadableDateTime(order.pickupTime)}
                />
                <QuickFact
                  icon={CalendarClock}
                  label="Return time"
                  value={formatReadableDateTime(order.returnTime)}
                />
              </>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <ActionGroup
          icon={CreditCard}
          title="Payment"
          detail={`${formatStatusLabel(order.payment?.method)} - ${formatStatusLabel(paymentStatus)}`}
        >
          {isPaymentPaid ? (
            order.status === "cancelled" && isPaymentRefunded ? null : (
              <Badge variant="secondary">
                Paid at
                {order.payment?.paidAt
                  ? ` ${formatReadableDateTime(order.payment.paidAt)}`
                  : ""}
              </Badge>
            )
          ) : (
            <Badge variant="outline">Awaiting payment</Badge>
          )}
        </ActionGroup>

        <ActionGroup
          icon={order.type === "rent" ? CalendarClock : Package}
          title={order.type === "rent" ? "Rental progress" : "Order progress"}
          detail={
            order.type === "rent"
              ? "Move the rental from pending to picked up, then returned."
              : "Move the order from pending to received."
          }
        >
          {order.status === "received" || order.status === "returned" ? (
            <Badge variant="secondary">
              {order.status === "received"
                ? "Outfit has been successfully received."
                : "Outfit has been successfully returned."}
            </Badge>
          ) : (
            <Badge variant="outline">{formatStatusLabel(order.status)}</Badge>
          )}
        </ActionGroup>

        {isRent && (
          <ActionGroup
            icon={Lock}
            className="lg:col-span-2"
            title="Security Deposit"
            detail={
              order.securityDeposit
                ? "Review the security deposit for this rental."
                : "No security deposit has been recorded for this rental."
            }
          >
            {order.securityDeposit ? (
              <DepositSummary deposit={order.securityDeposit} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Nothing recorded yet. Set a deposit from the action bar.
              </p>
            )}
          </ActionGroup>
        )}
      </div>

      <PaymentModal
        isCashDialogOpen={isCashDialogOpen}
        setIsCashDialogOpen={setIsCashDialogOpen}
        cashAmount={cashAmount}
        setCashAmount={setCashAmount}
        cashError={cashError}
        setCashError={setCashError}
        handleConfirmCashPayment={handleConfirmCashPayment}
        order={order}
        cashChange={cashChange}
        isUpdating={isUpdating}
      />

      {isRent && (
        <SecurityDepositModal
          key={`${order._id}-${order.securityDeposit?._id ?? "new"}-${order.securityDeposit?.updatedAt ?? ""}`}
          order={order}
          isSecurityDepositDialogOpen={isSecurityDepositDialogOpen}
          setIsSecurityDepositDialogOpen={setIsSecurityDepositDialogOpen}
          handleSecurityDepositSubmit={handleSecurityDepositSubmit}
        />
      )}

      {actions.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur md:left-72">
          <div className="flex flex-wrap items-center justify-end gap-2 px-4 py-3.5 md:px-6">
            {actions.map((action) => (
              <Button
                key={action.key}
                type="button"
                size="lg"
                variant={
                  action.destructive
                    ? "destructive"
                    : action.primary
                      ? "default"
                      : "outline"
                }
                // h-11 clears the 44px touch target; the design system's largest
                // size stops at h-9, so the pill is scaled here instead.
                className="h-11 gap-2 px-5 text-[0.95rem]"
                disabled={isUpdating || action.disabled}
                onClick={action.onClick}
              >
                <action.icon className="size-[1.125rem]" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type QuickFactProps = {
  icon: React.ComponentType<{className?: string}>;
  label: string;
  value: React.ReactNode;
};

function QuickFact({icon: Icon, label, value}: QuickFactProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 px-3.5 py-3">
      <div className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium leading-snug text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

function PaymentStatusBadge({status}: {status: string}) {
  const variant: "default" | "secondary" | "destructive" | "outline" =
    status === "paid"
      ? "default"
      : status === "failed"
        ? "destructive"
        : status === "refunded"
          ? "secondary"
          : "outline";

  return <Badge variant={variant}>{formatStatusLabel(status)}</Badge>;
}

type DepositFactProps = {
  icon: React.ComponentType<{className?: string}>;
  label: string;
  value: string;
  description?: string;
};

function DepositFact({icon: Icon, label, value, description}: DepositFactProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3.5 py-3 text-center">
      <div className="grid size-8 place-items-center rounded-full bg-primary/10">
        <Icon className="size-4 text-primary" />
      </div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-semibold leading-snug text-foreground">
        {value}
      </p>
      {description && (
        <p className="text-[11px] leading-tight text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

function DepositSummary({deposit}: {deposit: ISecurityDeposit}) {
  const typeMeta = TYPE_OPTIONS.find((option) => option.value === deposit.type);
  const statusMeta = STATUS_OPTIONS.find(
    (option) => option.value === deposit.status,
  );
  const TypeIcon = typeMeta?.icon ?? Lock;
  const StatusIcon = statusMeta?.icon ?? Lock;
  const depositValue =
    deposit.type === "Cash"
      ? formatCurrency(Number(deposit.amount))
      : deposit.IDType;

  return (
    <div className="grid w-full gap-3 sm:grid-cols-3">
      <DepositFact
        icon={TypeIcon}
        label="Type"
        value={typeMeta?.label ?? deposit.type}
        description={typeMeta?.description}
      />
      <DepositFact
        icon={deposit.type === "Cash" ? Banknote : (typeMeta?.icon ?? FileText)}
        label={deposit.type === "Cash" ? "Amount" : "ID type"}
        value={depositValue}
      />
      <DepositFact
        icon={StatusIcon}
        label="Status"
        value={statusMeta?.label ?? deposit.status}
        description={statusMeta?.description}
      />
    </div>
  );
}

type OrderAction = {
  key: string;
  icon: React.ComponentType<{className?: string}>;
  label: string;
  onClick: () => void;
  destructive?: boolean;
  primary?: boolean;
  disabled?: boolean;
};

type ActionGroupProps = {
  icon: React.ComponentType<{className?: string}>;
  title: string;
  detail: string;
  children: React.ReactNode;
  className?: string;
};

function ActionGroup({
  icon: Icon,
  title,
  detail,
  children,
  className,
}: ActionGroupProps) {
  return (
    <section
      className={`overflow-hidden rounded-xl border-0 bg-card shadow-sm ring-1 ring-border/60 ${className || ""}`}
    >
      <div className="flex items-start gap-3 border-b border-border/50 bg-muted/30 px-5 py-3.5">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <Icon className="size-3.5 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-start gap-3 p-5">{children}</div>
    </section>
  );
}
