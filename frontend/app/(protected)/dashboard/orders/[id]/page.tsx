"use client";

import Link from "next/link";
import {useParams} from "next/navigation";
import {motion} from "framer-motion";
import {ChevronLeft, CreditCard, XCircle} from "lucide-react";
import {fadeInUp} from "@/components/motion";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {cn} from "@/lib/utils";
import {OrderDetails} from "@/features/user-dashboard/orders/components/OrderDetails";
import {OrderStatusBadge} from "@/features/user-dashboard/orders/components/OrderStatusBadge";
import {
  cancelOrderService,
  fetchOrderByIdService,
} from "@/features/user-dashboard/orders/services/orderService";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {useReview} from "@/features/user-dashboard/review/hooks/useReview";
import {AlertDialogComponent} from "@/components/AlertDialog";
import {
  calculateReservationAmount,
  formatCurrency,
  getRemainingBalance,
} from "@/lib/formatters";
import {isOrderReference, normalizeReference} from "@/lib/reference-path";
import {NotFoundView} from "@/features/reusable/NotFoundView";
import {IRent} from "@/features/user-dashboard/rent/types/IRent";
import {IOrder} from "@/features/user-dashboard/buy/types/IOrder";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {ONLINE_PAYMENT_METHODS} from "@/features/user-dashboard/payment/types/IPaymongo";
import {usePackages} from "@/features/admin-dashboard/packages/hooks/usePackages";
import {useNotification} from "@/components/ui/alert";

const PAYABLE_METHODS = [...ONLINE_PAYMENT_METHODS, "online"];
const orderCanvas = "-mx-4 -my-6 min-w-0 space-y-6 px-4 py-6 md:-mx-6 md:px-6";

export default function OrderDetailsPage() {
  const params = useParams<{id: string}>();
  const orderId = normalizeReference(params.id);
  const isValidOrderReference = isOrderReference(orderId);
  const {user} = useAuth();
  const {userReviews} = useReview();
  const queryClient = useQueryClient();
  const {notify} = useNotification();

  const {
    data: order = null,
    isLoading,
    isError,
  } = useQuery<IRent | IOrder>({
    queryKey: ["user-order", orderId],
    queryFn: () => fetchOrderByIdService(orderId),
    enabled: isValidOrderReference,
  });

  const cancelOrderMutation = useMutation({
    mutationFn: cancelOrderService,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["user-order", orderId]});
      notify({
        title: "Order cancelled",
        description: "Your order has been successfully cancelled.",
        variant: "success",
      });
    },
  });

  const handleCancelOrder = async () => {
    if (!order) return;

    try {
      await cancelOrderMutation.mutateAsync({orderId, status: "cancelled"});
    } catch {
      notify({
        title: "Server Error",
        description: "There was an error in the server",
        variant: "error",
      });
    }
  };

  const reservation = order?.payment?.reservation;
  const isReservation = Boolean(reservation?.requested);
  const reservationPaid = reservation?.status === "paid";
  const reservationAmount = Number(
    reservation?.amount ?? calculateReservationAmount(order?.totalAmount ?? 0),
  );
  const finalPaymentMethod = order?.payment?.method;
  const reservationMethod = reservation?.method ?? finalPaymentMethod;
  const remainingBalance = getRemainingBalance(
    order?.totalAmount ?? 0,
    reservationAmount,
  );

  const needsReservationPayment =
    isReservation &&
    !reservationPaid &&
    reservation?.status !== "expired" &&
    reservation?.status !== "forfeited" &&
    order?.status !== "cancelled" &&
    PAYABLE_METHODS.includes(reservationMethod ?? "");

  const needsFinalOnlinePayment =
    isReservation &&
    reservationPaid &&
    order?.payment?.status === "pending" &&
    order.status !== "cancelled" &&
    PAYABLE_METHODS.includes(finalPaymentMethod ?? "");

  const needsOnlinePayment =
    !isReservation &&
    order?.payment?.status === "pending" &&
    order.status !== "cancelled" &&
    PAYABLE_METHODS.includes(finalPaymentMethod ?? "");

  const cancellableStatuses =
    order?.type === "rent"
      ? ["pending", "reserved", "ready", "active", "overdue"]
      : ["pending", "reserved", "ready"];
  const canCancel = Boolean(
    order && cancellableStatuses.includes(order.status),
  );

  // The package a package order belongs to is resolved from the package list.
  const {data: packages = []} = usePackages();

  if (!isValidOrderReference) {
    return (
      <div className="space-y-6">
        <BackToOrdersButton />
        <NotFoundView
          title="Order not found"
          description="This order reference is invalid or no longer available. Use the reference from your orders list."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={orderCanvas}>
        <BackToOrdersButton />
        <LoadingSkeleton />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <BackToOrdersButton />
        <NotFoundView
          title={isError ? "Unable to load order" : "Order not found"}
          description={
            isError
              ? "We could not load this order right now. Return to your orders and try again."
              : "The order or rent record does not exist in your orders."
          }
        />
      </div>
    );
  }

  return (
    <div className={cn(orderCanvas, canCancel && "pb-24")}>
      <BackToOrdersButton />

      <div>
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-secondary px-5 py-6 text-secondary-foreground md:px-6"
        >
          <div>
            <p className="mb-2 text-sm text-secondary-foreground/80">
              {order.type === "rent" ? "Rental order" : "Purchase order"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-all text-2xl font-semibold sm:text-3xl">
                {order.referenceID}
              </h1>
              <OrderStatusBadge status={order.status} type={order.type} />
            </div>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm text-secondary-foreground/80">Order total</p>
            <p className="text-2xl font-semibold tabular-nums">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
        </motion.div>
      </div>
      {order.status === "overdue" && (
        <Card className="border-border/50 bg-background p-5 md:p-6">
          <p className="text-base text-destructive leading-relaxed">
            This rent is overdue. Please return the outfit as soon as possible
            and settle your late return fee of{" "}
            {formatCurrency(order.totalAmount)}.
          </p>
        </Card>
      )}
      {reservation?.method === "cash" &&
        (reservation.status === "pending" ||
          reservation.status === "approved") &&
        order.payment?.status !== "paid" &&
        order.status !== "cancelled" && (
          <p className="rounded-lg border border-border/50 bg-background px-5 py-4 text-sm text-secondary md:px-6">
            {reservation.status === "pending"
              ? "Your cash reservation is awaiting staff approval. Pay the full amount within 24 hours of placing your order to avoid automatic cancellation."
              : "Your cash reservation is approved and the outfit is held. Pay the full amount within 24 hours of placing your order to avoid automatic cancellation."}
          </p>
        )}
      {(needsReservationPayment ||
        needsFinalOnlinePayment ||
        needsOnlinePayment) && (
        <Card className="gap-4 border-border/50 bg-background p-5 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary">
                {needsReservationPayment
                  ? "Reservation payment needed"
                  : needsFinalOnlinePayment
                    ? "Remaining payment needed"
                    : "Payment not completed"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                {needsReservationPayment ? (
                  <>
                    Pay {formatCurrency(reservationAmount)} online to reserve
                    this order. The remaining balance is due{" "}
                    {finalPaymentMethod === "cash"
                      ? "in cash at pickup"
                      : "in a second online payment"}
                    .
                  </>
                ) : needsFinalOnlinePayment ? (
                  <>
                    Pay {formatCurrency(remainingBalance)} online to complete
                    this reservation.
                  </>
                ) : (
                  <>
                    This {formatCurrency(order.totalAmount)} transaction is
                    still awaiting payment. You can pay for it now without
                    placing a new order.
                  </>
                )}
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link
                href={`/dashboard/payment/status?order_id=${encodeURIComponent(
                  order.referenceID ?? orderId,
                )}`}
              >
                <CreditCard className="size-4" />
                Pay now
              </Link>
            </Button>
          </div>
        </Card>
      )}

      <OrderDetails
        item={order}
        packages={packages}
        reviews={userReviews.filter((review) => {
          return review.orderID === order._id;
        })}
        onReviewSaved={() => {
          void queryClient.invalidateQueries({
            queryKey: ["user-reviews", user?._id],
          });
        }}
      />

      {canCancel && (
        <motion.div
          initial={{opacity: 0, y: 48}}
          animate={{opacity: 1, y: 0}}
          transition={{type: "spring", stiffness: 260, damping: 28, delay: 0.1}}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur"
        >
          <div className="mx-auto flex w-full max-w-7xl justify-end px-4 py-3 md:px-6">
            <AlertDialogComponent
              action={handleCancelOrder}
              title="Cancel this order?"
              description="This order will be cancelled and cannot be restored. Are you sure you want to continue?"
              actionLabel="Cancel order"
            >
              <Button
                type="button"
                size="lg"
                variant="destructive"
                className="h-11 w-full gap-2 px-5 text-[0.95rem] sm:w-auto"
              >
                <XCircle className="size-[1.125rem]" />
                Cancel order
              </Button>
            </AlertDialogComponent>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function BackToOrdersButton() {
  return (
    <Link
      href="/dashboard/orders"
      className="inline-flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft className="size-4" /> Back to orders
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading order details">
      <div className="flex flex-wrap justify-between gap-4 rounded-lg bg-secondary p-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 bg-secondary-foreground/20" />
          <Skeleton className="h-8 w-40 bg-secondary-foreground/20" />
        </div>
        <Skeleton className="h-8 w-28 bg-secondary-foreground/20" />
      </div>
      <Card className="gap-4 border-border/50 bg-background p-5 md:p-6">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-12 w-full" />
      </Card>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="gap-4 border-border/50 bg-background p-5 md:p-6">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </Card>
        <Card className="gap-4 border-border/50 bg-background p-5 md:p-6">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({length: 4}, (_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
