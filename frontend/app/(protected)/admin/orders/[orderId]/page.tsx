"use client";

import {useState} from "react";
import Image from "next/image";
import {useParams, useRouter} from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  XCircle,
} from "lucide-react";
import {cn} from "@/lib/utils";
import {StatusBadge} from "@/components/ui/status-badge";
import {Button} from "@/components/ui/button";
import {
  AdminPageHeader,
  AdminPageTitle,
} from "@/features/admin-dashboard/components/AdminPageHeader";
import {Skeleton} from "@/components/ui/skeleton";
import {
  calculateReservationAmount,
  formatCurrency,
  formatReadableDate,
  formatReadableDateTime,
  formatStatusLabel,
  getRemainingBalance,
} from "@/lib/formatters";
import {isOrderReference, normalizeReference} from "@/lib/reference-path";
import {NotFoundView} from "@/features/reusable/NotFoundView";
import {OutfitBranchBadge} from "@/features/reusable/OutfitBranchBadge";
import {OrderProgress} from "@/features/reusable/OrderProgress";
import {formatAddress} from "@/features/address/utils/formatAddress";
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
import {
  countItems,
  groupItemsByPackage,
  resolveOrderPackages,
} from "@/lib/package-identity";
import {usePackages} from "@/features/admin-dashboard/packages/hooks/usePackages";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import PaymentModal from "@/features/admin-dashboard/orders-tab/components/PaymentModal";
import SecurityDepositModal from "@/features/admin-dashboard/security-deposit/components/SecurityDepositModal";
import {ISecurityDeposit} from "@/features/admin-dashboard/security-deposit/types/ISecurityDeposit";
import {TYPE_OPTIONS} from "@/features/admin-dashboard/security-deposit/constants";
import {updateRentSecurityDepositService} from "@/features/admin-dashboard/security-deposit/services/securityDepositService";
import {useNotification} from "@/components/ui/alert";
import {AlertDialogComponent} from "@/components/AlertDialog";

const getStatuses = (
  order: AdminOrderItem,
  isPaymentPaid: boolean,
  hasSecurityDeposit: boolean,
) => {
  const isRent = order.type === "rent";
  const isCash = order.payment?.method === "cash";
  const reservation = order.payment?.reservation;
  const isReservation = Boolean(reservation?.requested);
  const reservationPaid = reservation?.status === "paid";
  const cashReservation = reservation?.method === "cash";
  const cashReservationApproved =
    cashReservation && reservation?.status === "approved";
  const canGoReady = !isReservation || reservationPaid;

  if (isRent) {
    if (order.status === "pending") {
      return [
        ...(cashReservation && reservation?.status === "pending"
          ? ["reserved"]
          : []),
        ...(canGoReady ? ["ready"] : []),
        "cancelled",
      ] as AdminOrderStatus[];
    }

    if (order.status === "reserved") {
      return [
        ...(reservationPaid || cashReservationApproved ? ["ready"] : []),
        "cancelled",
      ] as AdminOrderStatus[];
    }

    if (order.status === "ready") {
      return [
        ...(isPaymentPaid && hasSecurityDeposit ? ["active"] : []),
        "cancelled",
      ] as AdminOrderStatus[];
    }

    if (order.status === "active" || order.status === "overdue") {
      return ["returned", "cancelled"] as AdminOrderStatus[];
    }

    return [] as AdminOrderStatus[];
  }

  if (order.status === "pending") {
    return [
      ...(cashReservation && reservation?.status === "pending"
        ? ["reserved"]
        : []),
      ...((isCash || isPaymentPaid) && canGoReady ? ["ready"] : []),
      "cancelled",
    ] as AdminOrderStatus[];
  }

  if (order.status === "reserved") {
    return [
      ...(reservationPaid || cashReservationApproved ? ["ready"] : []),
      "cancelled",
    ] as AdminOrderStatus[];
  }

  if (order.status === "ready") {
    return [
      ...(isPaymentPaid ? ["received"] : []),
      "cancelled",
    ] as AdminOrderStatus[];
  }

  return [] as AdminOrderStatus[];
};

const getStatusActionLabel = (status: AdminOrderStatus) => {
  const labels: Record<AdminOrderStatus, string> = {
    pending: "Mark pending",
    reserved: "Approve reservation",
    ready: "Ready for fitting",
    received: "Received",
    active: "Active",
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

function SkeletonFactTile() {
  return (
    <div className="space-y-2 py-2">
      <Skeleton className="h-3 w-24 rounded-md" />
      <Skeleton className="h-5 w-40 rounded-md" />
    </div>
  );
}

function OrderDetailsSkeleton() {
  return (
    <div className="-m-6 min-h-[calc(100vh-4.5rem)] space-y-6 bg-muted p-6">
      <AdminPageHeader
        title={<AdminPageTitle icon={Package}>Order details</AdminPageTitle>}
        description="Status, payment, and rental progress for one order."
      />

      <div className="flex flex-col items-start gap-3">
        <Skeleton className="h-8 w-36 rounded-md" />
        <Skeleton className="h-9 w-48 rounded-md" />
      </div>

      <section className="overflow-hidden rounded-lg border border-border/50 bg-background">
        <div className="grid gap-6 bg-secondary p-5 md:grid-cols-[1.4fr_1fr] md:p-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-md bg-white/20" />
            <Skeleton className="h-9 w-52 rounded-md bg-white/20" />
            <Skeleton className="h-4 w-72 max-w-full rounded-md bg-white/20" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 rounded-md bg-white/20" />
            <Skeleton className="h-9 w-36 rounded-md bg-white/20" />
          </div>
        </div>
        <div className="grid gap-x-8 p-5 md:grid-cols-3 md:p-6">
          {Array.from({length: 3}).map((_, i) => (
            <SkeletonFactTile key={i} />
          ))}
        </div>
      </section>

      <section className="space-y-5 rounded-lg border border-border/50 bg-background p-5 md:p-6">
        <Skeleton className="h-7 w-40 rounded-md" />
        <Skeleton className="h-16 w-full rounded-md" />
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.85fr)]">
        <div className="space-y-6">
          <section className="rounded-lg border border-border/50 bg-background p-5 md:p-6">
            <Skeleton className="mb-5 h-7 w-32 rounded-md" />
            <div className="space-y-5">
              {Array.from({length: 2}).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="size-16 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-2/5 rounded-md" />
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                  </div>
                  <Skeleton className="h-5 w-24 rounded-md" />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5 rounded-lg border border-border/50 bg-background p-5 md:p-6">
            <Skeleton className="h-7 w-48 rounded-md" />
            <div className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-3">
              {Array.from({length: 6}).map((_, i) => (
                <SkeletonFactTile key={i} />
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {Array.from({length: 2}).map((_, sectionIndex) => (
            <section
              key={sectionIndex}
              className="space-y-5 rounded-lg border border-border/50 bg-background p-5 md:p-6"
            >
              <Skeleton className="h-7 w-40 rounded-md" />
              {Array.from({length: 4}).map((_, i) => (
                <SkeletonFactTile key={i} />
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminOrderDetailsPage() {
  const client = useQueryClient();
  const router = useRouter();
  const params = useParams<{orderId: string}>();
  const orderId = normalizeReference(params.orderId);
  const isValidOrderReference = isOrderReference(orderId);
  const {notify} = useNotification();

  const {
    data: order = null,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: () => fetchAdminOrderByIdService(orderId),
    enabled: isValidOrderReference,
  });

  // Package orders only store their costumes, so the package they belong to is
  // resolved from the package list.
  const {data: packages = []} = usePackages();

  const updateAdminOrderStatusMutation = useMutation({
    mutationFn: updateAdminOrderStatusService,
    onSuccess: (_data, variables) => {
      client.invalidateQueries({queryKey: ["admin-order"]});
      client.invalidateQueries({queryKey: ["admin-orders"]});
      client.invalidateQueries({queryKey: ["dashboard-orders"]});
      client.invalidateQueries({queryKey: ["dashboard-rents"]});
      client.invalidateQueries({queryKey: ["payments"]});
      client.invalidateQueries({queryKey: ["outfits"]});
      client.invalidateQueries({queryKey: ["outfit-stats"]});
      notify({
        title: "Order status updated",
        description: `Order status is now ${formatStatusLabel(variables.status, order?.type)}.`,
        variant: "success",
      });
    },
    onError: () => {
      notify({
        title: "Status update failed",
        description: "Unable to update order status. Please try again.",
        variant: "error",
      });
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
      client.invalidateQueries({queryKey: ["admin-orders"]});
      client.invalidateQueries({queryKey: ["dashboard-orders"]});
      client.invalidateQueries({queryKey: ["dashboard-rents"]});
      client.invalidateQueries({queryKey: ["payments"]});
    },
  });

  const markAdminOrderPaymentRefundedMutation = useMutation({
    mutationFn: markAdminOrderPaymentRefundedService,
    onSuccess: () => {
      client.invalidateQueries({queryKey: ["admin-order"]});
      client.invalidateQueries({queryKey: ["admin-orders"]});
      client.invalidateQueries({queryKey: ["dashboard-orders"]});
      client.invalidateQueries({queryKey: ["dashboard-rents"]});
      client.invalidateQueries({queryKey: ["payments"]});
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
        notify({
          title: "Invalid deposit amount",
          description: "Deposit amount must be a non-negative number.",
          variant: "warning",
        });
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
    if (!order || order.status === "cancelled") {
      return;
    }

    if (order.payment?.method === "cash") {
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
    const reservation = order.payment?.reservation;
    const reservationAmount = Number(
      reservation?.amount ?? calculateReservationAmount(order.totalAmount),
    );
    const amountDue =
      reservation?.status === "paid"
        ? getRemainingBalance(order.totalAmount, reservationAmount)
        : order.totalAmount;

    if (!Number.isFinite(cash) || cash < amountDue) {
      setCashError("Cash must be at least the remaining balance.");
      return;
    }

    await handleMarkPaymentPaid(cash, "cash");
  };

  const backToOrdersAction = (
    <Button
      type="button"
      variant="outline"
      onClick={() => router.push("/admin/orders")}
    >
      <ArrowLeft className="size-4" />
      Back to orders
    </Button>
  );

  if (!isValidOrderReference) {
    return (
      <NotFoundView
        title="Order not found"
        description="This order reference is invalid or no longer available. Use the reference from the orders list."
        actions={backToOrdersAction}
      />
    );
  }

  if (isLoading) {
    return <OrderDetailsSkeleton />;
  }

  if (!order || isError) {
    return (
      <NotFoundView
        title="Order not found"
        description={
          errorMessage ||
          (error
            ? "Unable to load this order right now."
            : "This order may have been removed, or the link is out of date.")
        }
        actions={backToOrdersAction}
      />
    );
  }

  const itemCount = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const resolved = resolveOrderPackages(order, packages);
  const packageGroups = groupItemsByPackage(order.items, resolved);
  // Single source of truth for payment status - falls back to paidAt
  // when payment.status hasn't been explicitly set. All paid/refunded
  // checks below use this instead of reading order.payment?.status
  // directly, so purchase and rent orders behave identically.
  const paymentStatus =
    order.payment?.status || (order.payment?.paidAt ? "paid" : "pending");
  const isPaymentPaid = paymentStatus === "paid";
  const isRent = order.type === "rent";
  const hasSecurityDeposit = Boolean(order.securityDeposit);
  const reservation = order.payment?.reservation;
  const isReservation = Boolean(reservation?.requested);
  const reservationPaid = reservation?.status === "paid";
  const reservationAmount = Number(
    reservation?.amount ?? calculateReservationAmount(order.totalAmount),
  );
  const amountDue = reservationPaid
    ? getRemainingBalance(order.totalAmount, reservationAmount)
    : order.totalAmount;
  const finalPaymentMethod = order.payment?.method;
  const reservationMethod = reservation?.method ?? finalPaymentMethod;
  const canMarkPaymentPaid =
    order.status === "ready" &&
    !isPaymentPaid &&
    finalPaymentMethod === "cash" &&
    (!isReservation || reservationPaid || reservation?.status === "approved") &&
    (!isRent || hasSecurityDeposit);
  const cashValue = Number(cashAmount);
  const cashChange =
    Number.isFinite(cashValue) && cashValue >= amountDue
      ? cashValue - amountDue
      : 0;
  const paymentDueNow =
    isPaymentPaid || order.status === "cancelled"
      ? 0
      : reservation?.method === "cash"
        ? amountDue
        : isReservation && !reservationPaid
          ? reservationAmount
          : amountDue;

  const paymentReadiness = (() => {
    if (order.status === "cancelled") {
      return {
        title: "Order cancelled",
        description:
          isPaymentPaid || reservationPaid
            ? "A recorded payment can be reviewed and refunded below."
            : "No further payment is required for this order.",
      };
    }

    if (isPaymentPaid) {
      return {
        title: "Payment complete",
        description:
          "The order is fully paid and ready for its next fulfillment step.",
      };
    }

    if (reservation?.method === "cash" && reservation.status === "pending") {
      return {
        title: "Awaiting staff approval",
        description:
          "Approve the cash reservation to hold stock. The full amount is due at pickup.",
      };
    }

    if (
      isReservation &&
      !reservationPaid &&
      reservation?.status !== "approved"
    ) {
      return {
        title: "Reservation payment required",
        description:
          "The reservation must be paid before this order can move forward.",
      };
    }

    if (isRent && order.status === "ready" && !hasSecurityDeposit) {
      return {
        title: "Security deposit required",
        description:
          "Record the security deposit before collecting the remaining payment.",
      };
    }

    if (canMarkPaymentPaid) {
      return {
        title: "Ready to collect payment",
        description:
          "The order has met its requirements and the balance can now be collected.",
      };
    }

    if (reservation?.method === "cash" && reservation.status === "approved") {
      return {
        title: "Cash reservation approved",
        description: "Stock is held. Collect the full amount at pickup.",
      };
    }

    return {
      title: "Payment pending",
      description:
        "Complete the current fulfillment step before collecting payment.",
    };
  })();

  // Keep action eligibility centralized, then place contextual controls in
  // their sections and the primary next step in the fixed bar.
  const actions: OrderAction[] = [
    ...((isPaymentPaid || reservationPaid) && order.status === "cancelled"
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
    ...(isRent && (hasSecurityDeposit || order.status === "ready")
      ? [
          {
            key: "deposit",
            icon: order.securityDeposit ? Pencil : Plus,
            label: order.securityDeposit ? "Edit deposit" : "Set deposit",
            onClick: () => setIsSecurityDepositDialogOpen(true),
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
    ...getStatuses(order, isPaymentPaid, hasSecurityDeposit).map((status) => ({
      key: `status-${status}`,
      icon: status === "cancelled" ? XCircle : CheckCircle2,
      label: getStatusActionLabel(status),
      destructive: status === "cancelled",
      primary: status === "ready" || status === "reserved",
      disabled: isUpdating || order.status === status,
      onClick: () => handleStatusChange(status),
    })),
  ];

  const depositAction = actions.find((action) => action.key === "deposit");
  const editDepositAction = hasSecurityDeposit ? depositAction : undefined;
  const cancelAction = actions.find(
    (action) => action.key === "status-cancelled",
  );
  const primaryActions = actions.filter(
    (action) =>
      action.key !== "status-cancelled" &&
      (action.key !== "deposit" || !hasSecurityDeposit),
  );

  return (
    <div
      className={cn(
        "-m-6 min-h-[calc(100vh-4.5rem)] space-y-6 bg-muted p-6",
        primaryActions.length > 0 && "pb-28",
      )}
    >
      <AdminPageHeader
        title={<AdminPageTitle icon={Package}>Order details</AdminPageTitle>}
        description="Review payment readiness and move the order forward."
      />

      <div className="space-y-5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin/orders")}
        >
          <ArrowLeft />
          Back to orders
        </Button>
        <div>
          <p className="text-sm text-muted-foreground">Order reference</p>
          <p className="mt-1 text-3xl font-semibold text-primary">
            {order.referenceID}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-border/50 bg-background">
        <div className="grid gap-6 bg-secondary px-5 py-6 text-white md:px-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-base text-white/70">Payment readiness</p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">
              {paymentReadiness.title}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/70">
              {paymentReadiness.description}
            </p>
          </div>
          <div>
            <p className="text-sm text-white/70">
              {reservation?.method === "cash" && !isPaymentPaid
                ? "Due at pickup"
                : "Due now"}
            </p>
            <p className="mt-1 text-3xl font-semibold tabular-nums md:text-4xl">
              {formatCurrency(paymentDueNow)}
            </p>
          </div>
        </div>
        <div className="grid gap-x-10 gap-y-4 p-5 sm:grid-cols-2 lg:grid-cols-4 md:p-6">
          <DetailItem
            label="Order total"
            value={formatCurrency(order.totalAmount)}
          />
          <DetailItem
            label="Payment method"
            value={formatStatusLabel(finalPaymentMethod)}
          />
          <DetailItem
            label="Payment status"
            value={<PaymentStatusBadge status={paymentStatus} />}
          />
          <DetailItem
            label="Order status"
            value={
              <AdminOrderStatusBadge status={order.status} type={order.type} />
            }
          />
        </div>
      </section>

      <section className="space-y-6 rounded-lg border border-border/50 bg-background p-5 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-primary md:text-2xl">
              Order progress
            </h2>
          </div>
          {cancelAction && (
            <OrderActionButton action={cancelAction} isUpdating={isUpdating} />
          )}
        </div>
        <OrderProgress
          type={order.type}
          status={order.status}
          paymentMethod={finalPaymentMethod}
          isPaymentPaid={isPaymentPaid}
          isPaymentRefunded={paymentStatus === "refunded"}
          cancelledFrom={order.cancelledFrom}
          hasSecurityDeposit={hasSecurityDeposit}
          isReservationRequested={isReservation}
          isReservationConfirmed={
            reservationPaid ||
            Boolean(reservation?.paidAt) ||
            (reservation?.method === "cash" && reservation.status === "approved")
          }
          nowrap
        />
      </section>

      {order.status === "cancelled" && order.cancelledAt && (
        <section className="rounded-lg border border-border/50 bg-background p-5 md:p-6">
          <h2 className="text-xl font-semibold text-primary md:text-2xl">
            Cancellation
          </h2>
          <p className="mt-3 text-sm text-secondary">
            Cancelled on {formatReadableDateTime(order.cancelledAt)}
          </p>
        </section>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.85fr)]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-lg border border-border/50 bg-background p-5 md:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-primary md:text-2xl">
                    Order contents
                  </h2>
                </div>
                <p className="mt-2 text-sm text-secondary/70">
                  {itemCount} item{itemCount === 1 ? "" : "s"}
                  {resolved.length > 0
                    ? ` across ${resolved.length} package${resolved.length === 1 ? "" : "s"}`
                    : ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary/70">Order total</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-secondary">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
            </div>

            {resolved.length > 0 && (
              <div className="mt-7">
                <p className="mb-4 text-sm font-semibold text-secondary">
                  {resolved.length === 1
                    ? "Included package"
                    : "Included packages"}
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {resolved.map((pkg, index) => {
                    const groupCount = countItems(
                      packageGroups?.[index]?.items ?? [],
                    );

                    return (
                      <div
                        key={pkg.packageId}
                        className="flex items-center gap-4"
                      >
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-background">
                          <Image
                            src={getSafeAdminOrderImageSrc(pkg.imageURL?.[0])}
                            alt={pkg.name || "Package"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-secondary">
                            {pkg.name}
                          </p>
                          <p className="mt-0.5 text-sm text-secondary/70">
                            {groupCount > 0
                              ? `${groupCount} outfit${groupCount === 1 ? "" : "s"} included`
                              : "Costumes included"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-7 hidden grid-cols-[minmax(0,1fr)_auto] gap-4 px-3 py-2 text-sm text-secondary/70 sm:grid">
              <span>Outfit and variant</span>
              <span>Item total</span>
            </div>
            <div className="mt-2 space-y-2">
              {packageGroups
                ? packageGroups.flatMap((group, groupIndex) => [
                    ...(packageGroups.length > 1
                      ? [
                          <div
                            key={`package-${groupIndex}`}
                            className="flex items-center gap-3 px-3 pt-4"
                          >
                            <div className="relative size-8 shrink-0 overflow-hidden rounded-md bg-muted">
                              <Image
                                src={getSafeAdminOrderImageSrc(
                                  group.identity.imageURL?.[0],
                                )}
                                alt={group.identity.name || "Package"}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <p className="truncate text-sm font-semibold text-secondary">
                              {group.identity.name}
                            </p>
                            <span className="shrink-0 text-sm text-secondary/70">
                              {countItems(group.items)} item
                              {countItems(group.items) === 1 ? "" : "s"}
                            </span>
                          </div>,
                        ]
                      : []),
                    ...group.items.map((item, index) => (
                      <AdminOrderItemRow
                        key={`${group.identity.packageId}-${item.outfitId}-${item.variantId}-${index}`}
                        item={item}
                      />
                    )),
                  ])
                : order.items.map((item, index) => (
                    <AdminOrderItemRow
                      key={`${item.outfitId}-${item.variantId}-${index}`}
                      item={item}
                    />
                  ))}
            </div>
          </section>

          <section className="rounded-lg border border-border/50 bg-background p-5 md:p-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-primary md:text-2xl">
                Customer and schedule
              </h2>
            </div>
            <div className="mt-6">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-secondary">Customer</p>
                <p className="mt-1 text-xl font-semibold text-secondary">
                  {getCustomerName(order)}
                </p>
              </div>
              <div className="mt-5">
                <p className="text-sm font-semibold text-secondary">
                  Customer address
                </p>
                <p className="mt-1 break-words text-base font-medium leading-relaxed text-secondary">
                  {formatAddress(order.address ?? order.user?.address) ||
                    "Not provided"}
                </p>
              </div>
              <div className="mt-6">
                <p className="text-sm font-semibold text-secondary">
                  Order context
                </p>
                <div className="mt-3 space-y-4 flex gap-16">
                  <DetailItem
                    label="Order type"
                    value={order.type === "rent" ? "Rental" : "Purchase"}
                  />
                  <DetailItem
                    label={
                      order.type === "rent" ? "Rental placed" : "Order placed"
                    }
                    value={formatReadableDateTime(order.createdAt)}
                  />
                </div>
              </div>
            </div>
            {isRent && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-secondary">
                  Rental schedule
                </p>
                <div className="mt-3 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
                  <DetailItem
                    label="Event date"
                    value={
                      order.eventDate
                        ? formatReadableDate(order.eventDate)
                        : "Not set"
                    }
                  />
                  <DetailItem
                    label="Pickup time"
                    value={formatReadableDateTime(order.pickupTime)}
                  />
                  <DetailItem
                    label="Due date"
                    value={formatReadableDateTime(order.duedate)}
                  />
                  <DetailItem
                    label="Return time"
                    value={formatReadableDateTime(order.returnTime)}
                  />
                </div>
              </div>
            )}
            <div className="mt-6 rounded-md bg-accent/20 px-4 py-3.5">
              <p className="text-sm font-semibold text-secondary">
                Customer notes
              </p>
              <p className="mt-1 break-words text-base leading-relaxed text-secondary/80">
                {order.notes?.trim() || "No notes provided"}
              </p>
            </div>
          </section>
        </div>

        <div className="min-w-0 space-y-6 xl:sticky xl:top-24">
          <section className="rounded-lg border border-border/50 bg-background p-5 md:p-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-primary md:text-2xl">
                Payment details
              </h2>
            </div>
            <div className="mt-6">
              <div className="grid grid-cols-2 gap-8">
                <DetailItem
                  label="Method"
                  value={formatStatusLabel(finalPaymentMethod)}
                />
                <DetailItem
                  label="Status"
                  value={<PaymentStatusBadge status={paymentStatus} />}
                />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {isReservation && (
                <>
                  <DetailItem
                    label="Reservation method"
                    value={formatStatusLabel(reservationMethod)}
                  />
                  <DetailItem
                    label="Reservation status"
                    value={<PaymentStatusBadge status={reservation?.status} />}
                  />
                  <DetailItem
                    label={
                      reservation?.method === "cash"
                        ? isPaymentPaid
                          ? "Cash paid"
                          : "Due at pickup"
                        : reservationPaid
                          ? "Remaining balance"
                          : "Reservation payment (50%)"
                    }
                    value={formatCurrency(
                      reservation?.method === "cash" || reservationPaid
                        ? amountDue
                        : reservationAmount,
                    )}
                  />
                  {!reservationPaid && reservation?.deadlineAt && (
                    <DetailItem
                      label="Pay by"
                      value={formatReadableDateTime(reservation.deadlineAt)}
                    />
                  )}
                  {reservationPaid && reservation?.paidAt && (
                    <DetailItem
                      label="Reservation paid at"
                      value={formatReadableDateTime(reservation.paidAt)}
                    />
                  )}
                  {reservationPaid && reservation?.refundableUntil && (
                    <DetailItem
                      label="Refundable after"
                      value={formatReadableDateTime(
                        reservation.refundableUntil,
                      )}
                    />
                  )}
                </>
              )}
              {order.payment?.cash !== undefined && (
                <DetailItem
                  label="Cash received"
                  value={formatCurrency(order.payment.cash)}
                />
              )}
              {order.payment?.change !== undefined && (
                <DetailItem
                  label="Change"
                  value={formatCurrency(order.payment.change)}
                />
              )}
              {order.payment?.paidAt && (
                <DetailItem
                  label="Paid at"
                  value={formatReadableDateTime(order.payment.paidAt)}
                />
              )}
            </div>
          </section>

          {isRent && (
            <section className="rounded-lg border border-border/50 bg-background p-5 md:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:items-start">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-primary md:text-2xl">
                    Security deposit
                  </h2>
                </div>
                {editDepositAction && (
                  <OrderActionButton
                    action={editDepositAction}
                    isUpdating={isUpdating}
                  />
                )}
              </div>
              <div className="mt-6">
                {order.securityDeposit ? (
                  <DepositSummary deposit={order.securityDeposit} />
                ) : (
                  <div>
                    <p className="text-base font-medium text-secondary">
                      Deposit not recorded
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-secondary/70">
                      Add the required security deposit before the rental is
                      released.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      <PaymentModal
        isCashDialogOpen={isCashDialogOpen}
        setIsCashDialogOpen={setIsCashDialogOpen}
        cashAmount={cashAmount}
        setCashAmount={setCashAmount}
        cashError={cashError}
        setCashError={setCashError}
        handleConfirmCashPayment={handleConfirmCashPayment}
        amountDue={amountDue}
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

      {primaryActions.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur md:left-72">
          <div className="flex flex-wrap items-center justify-end gap-2 px-4 py-3 md:px-6">
            <p className="mr-auto hidden text-sm text-secondary/70 sm:block">
              Next order action
            </p>
            {primaryActions.map((action) => (
              <OrderActionButton
                key={action.key}
                action={action}
                isUpdating={isUpdating}
                primary
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type AdminOrderItemRowProps = {
  item: AdminOrderItem["items"][number];
};

function AdminOrderItemRow({item}: AdminOrderItemRowProps) {
  const itemTotal = Number(item.price) * item.quantity;

  return (
    <div className="flex flex-col gap-3 px-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 gap-3">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
          <Image
            src={getSafeAdminOrderImageSrc(item.imageURL)}
            alt={item.name || "Order item"}
            fill
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-secondary">
            {item.name}
          </p>
          <OutfitBranchBadge branch={item.branch} className="mt-0.5" />
          <p className="mt-1 text-sm text-secondary/70">
            {item.category} - Size {item.size} - {item.color}
          </p>
          <p className="text-sm text-secondary/70">
            Qty {item.quantity} x {formatCurrency(Number(item.price))}
          </p>
        </div>
      </div>
      <div className="shrink-0 text-left">
        <p className="text-sm text-secondary/70">Item total</p>
        <p className="mt-0.5 text-base font-semibold tabular-nums text-secondary">
          {formatCurrency(itemTotal)}
        </p>
      </div>
    </div>
  );
}

type DetailItemProps = {
  label: string;
  value: React.ReactNode;
};

function DetailItem({label, value}: DetailItemProps) {
  return (
    <div className="min-w-0 py-1">
      <p className="text-sm text-secondary/70">{label}</p>
      <div className="mt-1 break-words text-base font-medium leading-snug text-secondary">
        {value}
      </div>
    </div>
  );
}

function PaymentStatusBadge({status}: {status?: string}) {
  return <StatusBadge status={status} />;
}

function DepositSummary({deposit}: {deposit: ISecurityDeposit}) {
  const typeMeta = TYPE_OPTIONS.find((option) => option.value === deposit.type);
  const depositValue =
    deposit.type === "Cash"
      ? formatCurrency(Number(deposit.amount))
      : deposit.IDType;

  return (
    <div className="grid gap-x-10 gap-y-4 sm:grid-cols-3 xl:grid-cols-1">
      <DetailItem label="Type" value={typeMeta?.label ?? deposit.type} />
      <DetailItem
        label={deposit.type === "Cash" ? "Amount" : "ID type"}
        value={depositValue}
      />
      <DetailItem
        label="Status"
        value={<StatusBadge status={deposit.status} />}
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

type OrderActionButtonProps = {
  action: OrderAction;
  isUpdating: boolean;
  primary?: boolean;
};

function OrderActionButton({
  action,
  isUpdating,
  primary = false,
}: OrderActionButtonProps) {
  const button = (
    <Button
      type="button"
      size={primary ? "lg" : "default"}
      variant={
        action.destructive
          ? "destructive"
          : action.primary || primary
            ? "default"
            : "outline"
      }
      className={cn(primary && "h-11 gap-2 px-5 text-[0.95rem]")}
      disabled={isUpdating || action.disabled}
      onClick={action.destructive ? undefined : action.onClick}
    >
      <action.icon className="size-4" />
      {action.label}
    </Button>
  );

  if (!action.destructive) {
    return button;
  }

  const isRefund = action.key === "refund";

  return (
    <AlertDialogComponent
      action={action.onClick}
      isLoading={isUpdating}
      title={isRefund ? "Refund this payment?" : "Cancel this order?"}
      description={
        isRefund
          ? "This will mark the order's payment as refunded."
          : "This order will be marked as cancelled."
      }
      actionLabel={action.label}
    >
      {button}
    </AlertDialogComponent>
  );
}
