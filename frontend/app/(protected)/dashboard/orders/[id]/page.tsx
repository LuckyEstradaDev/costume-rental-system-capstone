"use client";

import Link from "next/link";
import {useState} from "react";
import {useParams} from "next/navigation";
import {ArrowLeft} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {OrderDetails} from "@/features/user-dashboard/orders/components/OrderDetails";
import {OrderStatusBadge} from "@/features/user-dashboard/orders/components/OrderStatusBadge";
import {fetchOrderByIdService} from "@/features/user-dashboard/orders/services/orderService";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {useReview} from "@/features/user-dashboard/review/hooks/useReview";
import {formatCurrency} from "@/lib/formatters";
import {getIdFromSlug} from "@/lib/slug";
import {StripePaymentDialog} from "@/features/user-dashboard/checkout/components/StripePaymentDialog";

import {loadStripe} from "@stripe/stripe-js";
import {CheckoutElementsProvider} from "@stripe/react-stripe-js/checkout";
import {fetchStripeSession} from "@/features/user-dashboard/checkout/services/services";
import {IRent} from "@/features/user-dashboard/rent/types/IRent";
import {IOrder} from "@/features/user-dashboard/buy/types/IOrder";
import {useQuery, useQueryClient} from "@tanstack/react-query";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

export default function OrderDetailsPage() {
  const params = useParams<{id: string}>();
  const orderId = getIdFromSlug(params.id);
  const {user} = useAuth();
  const {userReviews} = useReview();
  const queryClient = useQueryClient();
  const [paymentDialog, setPaymentDialogOpen] = useState(false);

  const {
    data: order = null,
    isLoading,
    isError,
  } = useQuery<IRent | IOrder>({
    queryKey: ["user-order", params.id],
    queryFn: () => fetchOrderByIdService(orderId),
    enabled: Boolean(params.id),
  });

  const needsOnlinePayment =
    order?.payment?.status === "pending" && order.payment.method === "online";
  const {data: stripeSessionData} = useQuery({
    queryKey: ["stripe-session", params.id, user?._id, order?.payment?._id],
    queryFn: () =>
      fetchStripeSession({
        paymentID: order!.payment!._id!,
        userID: user!._id!,
        orderID: orderId,
      }),
    enabled: Boolean(
      needsOnlinePayment && order?.payment?._id && user?._id && params.id,
    ),
  });
  const session = stripeSessionData?.data.client_secret ?? null;

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

  const pageContent = (
    <div className="space-y-6">
      <BackToOrdersButton />

      <Card className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold">{order.referenceID}</h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-muted-foreground">
              {order.type === "rent" ? "Rental details" : "Order details"}
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
        </div>
      </Card>
      {/* display a "please return outfit if the rent is overdue" */}
      {order.status === "overdue" && (
        <Card className="p-5">
          <p className="text-md text-red-600">
            This rent is overdue. Please return the outfit as soon as possible
            and settle your late return fee of {formatCurrency(200)}.
          </p>
        </Card>
      )}
      {needsOnlinePayment && (
        <div>
          <Button
            onClick={() => setPaymentDialogOpen((prev) => !prev)}
            disabled={!session}
          >
            {session ? "Pay Online" : "Preparing payment..."}
          </Button>
          {session && (
            <StripePaymentDialog
              open={paymentDialog}
              order={order}
              onOpenChange={setPaymentDialogOpen}
            />
          )}
        </div>
      )}

      <OrderDetails
        item={order}
        reviews={userReviews.filter((review) => {
          return review.orderID === order._id;
        })}
        onReviewSaved={() => {
          void queryClient.invalidateQueries({
            queryKey: ["user-reviews", user?._id],
          });
        }}
      />
    </div>
  );

  if (needsOnlinePayment && session) {
    return (
      <CheckoutElementsProvider
        stripe={stripePromise}
        options={{clientSecret: session}}
      >
        {pageContent}
      </CheckoutElementsProvider>
    );
  }

  return pageContent;
}

function BackToOrdersButton() {
  return (
    <Button variant="outline" asChild>
      <Link href="/dashboard/orders">
        <ArrowLeft className="size-4" />
        Back to orders
      </Link>
    </Button>
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
      <Card className="overflow-hidden border-0 bg-card shadow-sm ring-1 ring-border/60">
        <div className="flex items-center gap-3 border-b border-border/50 bg-muted/30 px-5 py-3.5">
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="h-4 w-40 rounded-md" />
        </div>

        <div className="p-5">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
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
        </div>
      </Card>

      {/* Order items card skeleton */}
      <Card className="overflow-hidden border-0 bg-card shadow-sm ring-1 ring-border/60">
        <div className="flex items-center gap-2.5 border-b border-border/50 bg-muted/30 px-5 py-3.5">
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="ml-auto h-3 w-12 rounded-md" />
        </div>

        <div className="divide-y divide-border/50">
          {Array.from({length: 2}).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 sm:p-5">
              <Skeleton className="size-20 shrink-0 rounded-[10px] sm:size-[88px]" />
              <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                <Skeleton className="h-4 w-1/3 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
                <Skeleton className="h-3 w-1/4 rounded-md" />
                <Skeleton className="h-7 w-24 rounded-md sm:ml-auto sm:mt-1" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
