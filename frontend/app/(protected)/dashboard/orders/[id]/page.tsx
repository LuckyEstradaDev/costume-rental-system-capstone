"use client";

import Link from "next/link";
import {useState} from "react";
import {useParams} from "next/navigation";
import {ArrowLeft} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {OrderDetails} from "@/features/user-dashboard/orders/components/OrderDetails";
import {OrderStatusBadge} from "@/features/user-dashboard/orders/components/OrderStatusBadge";
import {fetchOrderByIdService} from "@/features/user-dashboard/orders/services/orderService";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {useReview} from "@/features/user-dashboard/review/hooks/useReview";
import {formatCurrency} from "@/lib/formatters";
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
    queryFn: () => fetchOrderByIdService(params.id),
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
        orderID: params.id,
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

        <Card className="p-8 text-center text-muted-foreground">
          Loading order details...
        </Card>
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
