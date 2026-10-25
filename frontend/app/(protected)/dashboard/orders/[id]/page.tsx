"use client";

import Link from "next/link";
import {useParams} from "next/navigation";
import {ChevronLeft, CreditCard, XCircle} from "lucide-react";
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
import {formatCurrency, formatStatusLabel} from "@/lib/formatters";
import {getIdFromSlug} from "@/lib/slug";
import {IRent} from "@/features/user-dashboard/rent/types/IRent";
import {IOrder} from "@/features/user-dashboard/buy/types/IOrder";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {ONLINE_PAYMENT_METHODS} from "@/features/user-dashboard/payment/types/IPaymongo";
import {usePackages} from "@/features/admin-dashboard/packages/hooks/usePackages";
import {updateAdminOrderStatusService} from "@/features/admin-dashboard/orders-tab/services/adminOrderService";
import {useNotification} from "@/components/ui/alert";

const PAYABLE_METHODS = [...ONLINE_PAYMENT_METHODS, "online"];

export default function OrderDetailsPage() {
  const params = useParams<{id: string}>();
  const orderId = getIdFromSlug(params.id);
  const {user} = useAuth();
  const {userReviews} = useReview();
  const queryClient = useQueryClient();
  const {notify} = useNotification();

  const {
    data: order = null,
    isLoading,
    isError,
  } = useQuery<IRent | IOrder>({
    queryKey: ["user-order", params.id],
    queryFn: () => fetchOrderByIdService(orderId),
    enabled: Boolean(params.id),
  });

  const cancelOrderMutation = useMutation({
    mutationFn: cancelOrderService,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["user-order", params.id]});
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
      cancelOrderMutation.mutateAsync({orderId, status: "cancelled"});
    } catch (error) {
      notify({
        title: "Server Error",
        description: "There was an error in the server",
        variant: "error",
      });
    }
  };

  const needsOnlinePayment =
    order?.payment?.status === "pending" &&
    order.status !== "cancelled" &&
    PAYABLE_METHODS.includes(order.payment?.method ?? "");

  const canCancel = order?.status === "pending";

  // The package a package order belongs to is resolved from the package list.
  const {data: packages = []} = usePackages();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <BackToOrdersButton />
        <LoadingSkeleton />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <BackToOrdersButton />

        <Card className="p-8 text-center">
          <h1 className="text-xl font-semibold">Order not found</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isError
              ? "Unable to fetch order details."
              : "The order or rent record does not exist in your orders."}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", canCancel && "pb-24")}>
      <BackToOrdersButton />

      <div>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold">{order.referenceID}</h1>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
        </div>
      </div>
      {/* display a "please return outfit if the rent is overdue" */}
      {order.status === "overdue" && (
        <Card className="p-5">
          <p className="text-md text-red-600">
            This rent is overdue. Please return the outfit as soon as possible
            and settle your late return fee of{" "}
            {formatCurrency(order.totalAmount)}.
          </p>
        </Card>
      )}
      {needsOnlinePayment && (
        <Card className="gap-4 border-amber-300 bg-amber-50/50 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-semibold text-foreground">
                <CreditCard className="size-4 text-amber-600" />
                Payment not completed
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This {formatCurrency(order.totalAmount)} transaction is still
                awaiting payment. You can pay for it now without placing a new
                order.
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link href={`/dashboard/payment/status?order_id=${orderId}`}>
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
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background">
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
        </div>
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
    <div className="space-y-6">
      {/* Summary card skeleton */}
      <Card className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64 rounded-md" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="ml-auto h-3 w-16 rounded-md" />
            <Skeleton className="ml-auto h-7 w-28 rounded-md" />
          </div>
        </div>
      </Card>

      {/* Transaction details card skeleton */}
      <Card className="h-fit gap-0 rounded-lg border border-border bg-card p-5">
        <Skeleton className="h-5 w-44 rounded-md" />

        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({length: 6}).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 px-3.5 py-3"
            >
              <Skeleton className="size-8 shrink-0 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-2.5 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Order items card skeleton */}
      <Card className="h-fit gap-0 rounded-lg border border-border bg-card p-5">
        <Skeleton className="h-5 w-16 rounded-md" />
        <div className="mb-4 mt-4 h-0.5 w-full rounded-full bg-border" />

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-2.5 w-10 rounded-md" />
            <div className="flex shrink-0 items-center gap-4">
              <Skeleton className="h-2.5 w-8 rounded-md" />
              <Skeleton className="h-2.5 w-12 rounded-md" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {Array.from({length: 2}).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Skeleton className="size-12 shrink-0 rounded-md" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <Skeleton className="h-4 w-8 rounded-md" />
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
