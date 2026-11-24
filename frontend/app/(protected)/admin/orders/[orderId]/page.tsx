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
import {OrderProgress} from "@/features/reusable/OrderProgress";
import {OrderDetailField, OrderDetailPanel} from "@/features/reusable/OrderDetailPanel";
import {OrderCancellationAndRefund} from "@/features/reusable/OrderCancellationAndRefund";
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
    reserved: "Confirm reservation payment",
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
        </div>
      </section>

      <section className="space-y-5 rounded-lg border border-border/50 bg-background p-5 md:p-6">
        <Skeleton className="h-7 w-40 rounded-md" />
        <Skeleton className="h-16 w-full rounded-md" />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="col-span-full space-y-5 rounded-lg border border-border/50 bg-background p-5 md:p-6">
          <Skeleton className="h-7 w-32 rounded-md" />
          {Array.from({length: 2}, (_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="size-16 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/5 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>
              <Skeleton className="h-5 w-24 rounded-md" />
            </div>
          ))}
        </section>
        {Array.from({length: 2}, (_, index) => (
          <section key={index} className="space-y-5 rounded-lg border border-border/50 bg-background p-5 md:p-6">
            <Skeleton className="h-7 w-40 rounded-md" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({length: 4}, (_, field) => <SkeletonFactTile key={field} />)}
            </div>
          </section>
        ))}
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
  const isLegacyCashReservation = reservation?.method === "cash" && reservation.status === "approved";
  const reservationAmount = Number(
    reservation?.amount ?? calculateReservationAmount(order.totalAmount),
  );
  const remainingBalance = getRemainingBalance(order.totalAmount, reservationAmount);
  const amountDue = reservationPaid ? remainingBalance : order.totalAmount;
  const finalPaymentMethod = order.payment?.method;
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
  const recordedReservationPayment =
    isReservation && !isLegacyCashReservation &&
    (reservationPaid || Boolean(reservation?.paidAt) ||
      reservation?.status === "forfeited" ||
      (reservation?.method !== "cash" && reservation?.status === "refunded"));

  const paymentReadiness = (() => {
    if (order.status === "cancelled" && order.refundRequested) {
      return {
        title: "Refund requested",
        description: paymentStatus === "refunded"
          ? "The customer requested a refund. The payment is marked as refunded."
          : "The customer requested a refund for this cancelled order.",
      };
    }

    if (order.status === "cancelled") {
      return {
        title: "Order cancelled",
        description:
          (order.refund?.amount ?? 0) > 0
            ? "A recorded payment can be reviewed and refunded below."
            : "No further payment is required for this order.",
      };
    }

    if (isPaymentPaid) {
      return {
        title: "Payment complete",
        description: null,
      };
    }

    if (reservation?.method === "cash" && reservation.status === "pending") {
      return {
        title: "Awaiting staff approval",
        description:
          "Collect the reservation fee and confirm receipt to hold stock. The remaining balance is due at pickup.",
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
    ...(order.status === "cancelled" && (order.refund?.amount ?? 0) > 0
      ? [
          {
            key: "refund",
            icon: RotateCcw,
            label: "Refund payment",
            disabled: isUpdating,
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
      confirmationDescription: status === "reserved"
        ? `Confirm that you received the ${formatCurrency(reservationAmount)} cash reservation fee. The remaining ${formatCurrency(remainingBalance)} is due at pickup.`
        : undefined,
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
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="break-all text-2xl font-semibold text-primary sm:text-3xl">
              {order.referenceID}
            </h1>
            <AdminOrderStatusBadge status={order.status} type={order.type} />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-border/50 bg-background">
        <div className="bg-secondary px-5 py-6 text-white md:px-6">
          {paymentReadiness.title !== "Order cancelled" && (
            <h2 className="text-3xl font-semibold md:text-4xl">{paymentReadiness.title}</h2>
          )}
          {paymentReadiness.description && (
            <p className={cn("max-w-2xl text-base leading-relaxed text-white/70", paymentReadiness.title !== "Order cancelled" && "mt-3")}>
              {paymentReadiness.description}
            </p>
          )}
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

      {order.status === "cancelled" && (
        <OrderCancellationAndRefund
          cancelledAt={order.cancelledAt}
          isRefunded={paymentStatus === "refunded"}
          refundedAt={order.payment?.refundedAt ?? order.payment?.updatedAt}
        />
      )}

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="col-span-full rounded-lg border border-border/50 bg-background p-5 md:p-6">
          <h2 className="text-xl font-semibold text-primary md:text-2xl">Order contents</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left">
              <thead className="text-sm text-muted-foreground">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-medium">Item</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">Qty × price</th>
                  <th scope="col" className="py-2 pl-4 text-right font-medium">Total</th>
                </tr>
              </thead>
              {packageGroups ? packageGroups.map((group, groupIndex) => (
                <tbody key={`${group.identity.packageId}-${groupIndex}`}>
                  <tr>
                    <th scope="rowgroup" colSpan={3} className="py-2 text-sm font-semibold text-primary">
                      {group.identity.name}
                    </th>
                  </tr>
                  {group.items.map((item, index) => (
                    <AdminOrderItemRow key={`${item.outfitId}-${item.variantId}-${index}`} item={item} />
                  ))}
                </tbody>
              )) : (
                <tbody>
                  {order.items.map((item, index) => (
                    <AdminOrderItemRow key={`${item.outfitId}-${item.variantId}-${index}`} item={item} />
                  ))}
                </tbody>
              )}
            </table>
          </div>
          <dl className="mt-4 space-y-2 border-t border-border/50 pt-4 text-sm text-secondary">
            {recordedReservationPayment && (
              <>
                <div className="flex items-center justify-between gap-4">
                  <dt>Reservation payment</dt>
                  <dd className="tabular-nums">{formatCurrency(reservationAmount)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Final payment</dt>
                  <dd className="tabular-nums">{formatCurrency(remainingBalance)}</dd>
                </div>
              </>
            )}
            <div className="flex items-center justify-between gap-4 font-semibold text-primary">
              <dt>{recordedReservationPayment ? "Total payment" : "Order total"}</dt>
              <dd className="tabular-nums">{formatCurrency(order.totalAmount)}</dd>
            </div>
          </dl>
        </section>

        <OrderDetailPanel title="Customer details" singleColumn>
          <OrderDetailField label="Customer" value={getCustomerName(order)} />
          <OrderDetailField label="Customer address" value={formatAddress(order.address ?? order.user?.address) || "Not provided"} />
          <OrderDetailField
            label="Customer notes"
            value={order.notes?.trim() || "No notes provided"}
          />
        </OrderDetailPanel>

        <OrderDetailPanel title="Transaction details" singleColumn>
          <OrderDetailField label="Order type" value={isRent ? "Rental" : "Purchase"} />
          <OrderDetailField label="Order placed" value={formatReadableDateTime(order.createdAt)} />
          <OrderDetailField label="Payment method" value={formatStatusLabel(finalPaymentMethod)} />
          {paymentReadiness.title !== "Payment complete" && paymentReadiness.title !== "Payment pending" &&
            !(order.status === "cancelled" && paymentStatus === "refunded") && (
              <OrderDetailField label="Payment status" value={<PaymentStatusBadge status={paymentStatus} />} />
            )}
          {order.payment?.paidAt && (
            <OrderDetailField label="Paid at" value={formatReadableDateTime(order.payment.paidAt)} />
          )}
          {order.payment?.cash !== undefined && (
            <OrderDetailField label="Cash received" value={formatCurrency(order.payment.cash)} />
          )}
          {order.payment?.change !== undefined && (
            <OrderDetailField label="Change" value={formatCurrency(order.payment.change)} />
          )}
        </OrderDetailPanel>

        {isRent && (
          <OrderDetailPanel title="Rental schedule" singleColumn className={!isReservation ? "col-span-full" : undefined}>
            <OrderDetailField label="Event date" value={order.eventDate ? formatReadableDate(order.eventDate) : "Not set"} />
            <OrderDetailField label="Pickup time" value={order.pickupTime ? formatReadableDateTime(order.pickupTime) : "Not picked up yet"} />
            <OrderDetailField label="Due date" value={order.duedate ? formatReadableDateTime(order.duedate) : "Not available yet"} />
            <OrderDetailField label="Return time" value={order.returnTime ? formatReadableDateTime(order.returnTime) : "Not returned yet"} />
          </OrderDetailPanel>
        )}

        {isReservation && (
          <OrderDetailPanel title="Reservation details" singleColumn className={!isRent ? "col-span-full" : undefined}>
            <OrderDetailField label="Reservation method" value={formatStatusLabel(reservation?.method)} />
            <OrderDetailField label="Reservation status" value={<PaymentStatusBadge status={reservation?.status} />} />
            {!isLegacyCashReservation && !recordedReservationPayment && (
              <OrderDetailField label="Reservation fee" value={formatCurrency(reservationAmount)} />
            )}
            {reservation?.deadlineAt && (
              <OrderDetailField label="Payment deadline" value={formatReadableDateTime(reservation.deadlineAt)} />
            )}
            {reservation?.paidAt && (
              <OrderDetailField label="Paid at" value={formatReadableDateTime(reservation.paidAt)} />
            )}
            {reservation?.refundableUntil && (
              <OrderDetailField label="Recorded refund deadline" value={formatReadableDateTime(reservation.refundableUntil)} />
            )}
          </OrderDetailPanel>
        )}

        {isRent && (
          <section className="col-span-full rounded-lg border border-border/50 bg-background p-5 md:p-6">
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
                  <p className="mt-1 text-base leading-relaxed text-muted-foreground">
                    Add the required security deposit before the rental is
                    released.
                  </p>
                </div>
              )}
            </div>
          </section>
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
            <p className="mr-auto hidden text-sm text-muted-foreground sm:block">
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
  const unitPrice = Number(item.price);
  const itemTotal = unitPrice * item.quantity;

  return (
    <tr>
      <td className="py-2 pr-4">
        <div className="flex items-center gap-3">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image
              src={getSafeAdminOrderImageSrc(item.imageURL)}
              alt={item.name || "Order item"}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-base font-semibold text-secondary">{item.name}</span>
          <span className="text-sm text-muted-foreground">
            {[item.category, item.size, item.color].filter(Boolean).join(" · ")}
          </span>
        </div>
      </td>
      <td className="px-4 py-2 text-right text-sm tabular-nums text-secondary">
        {item.quantity} × {formatCurrency(unitPrice)}
      </td>
      <td className="py-2 pl-4 text-right text-base font-semibold tabular-nums text-secondary">
        {formatCurrency(itemTotal)}
      </td>
    </tr>
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
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
      <OrderDetailField label="Type" value={typeMeta?.label ?? deposit.type} />
      <OrderDetailField
        label={deposit.type === "Cash" ? "Amount" : "ID type"}
        value={depositValue}
      />
      <OrderDetailField
        label="Status"
        value={<StatusBadge status={deposit.status} />}
      />
    </dl>
  );
}

type OrderAction = {
  key: string;
  icon: React.ComponentType<{className?: string}>;
  label: string;
  onClick: () => void;
  destructive?: boolean;
  confirmationDescription?: string;
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
  const needsConfirmation = primary || action.destructive || Boolean(action.confirmationDescription);
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
      onClick={needsConfirmation ? undefined : action.onClick}
    >
      <action.icon className="size-4" />
      {action.label}
    </Button>
  );

  if (!needsConfirmation) {
    return button;
  }

  const isRefund = action.key === "refund";

  return (
    <AlertDialogComponent
      action={action.onClick}
      isLoading={isUpdating}
      title={action.confirmationDescription ? "Confirm receipt of the cash reservation fee?" : isRefund ? "Refund this payment?" : action.destructive ? "Cancel this order?" : `${action.label}?`}
      description={
        action.confirmationDescription ?? (isRefund
          ? "This will mark the order's payment as refunded."
          : action.destructive
            ? "This order will be marked as cancelled."
            : `Continue with “${action.label}” for this order.`)
      }
      actionLabel={action.label}
    >
      {button}
    </AlertDialogComponent>
  );
}
