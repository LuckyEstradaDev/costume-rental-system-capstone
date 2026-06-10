"use client";

import Link from "next/link";
import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import {ArrowLeft} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {OrderDetails} from "@/features/user-dashboard/orders/components/OrderDetails";
import {OrderStatusBadge} from "@/features/user-dashboard/orders/components/OrderStatusBadge";
import {fetchOrderByIdService} from "@/features/user-dashboard/orders/services/orderService";
import {OrderTrackingItem} from "@/features/user-dashboard/orders/types/IOrderTracking";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {useReview} from "@/features/user-dashboard/review/hooks/useReview";
import {formatCurrency} from "@/lib/formatters";

export default function OrderDetailsPage() {
  const params = useParams<{id: string}>();
  const {user} = useAuth();
  const {userReviews, getUserReviews} = useReview();
  const [order, setOrder] = useState<OrderTrackingItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!params.id) {
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const {data} = await fetchOrderByIdService(params.id);
        console.log(data);
        setOrder(data.data);
        if (user?._id) {
          await getUserReviews(user._id);
        }
      } catch {
        setOrder(null);
        setErrorMessage("Unable to fetch order details.");
      }

      setIsLoading(false);
    };

    fetchOrder();
  }, [getUserReviews, params.id, user?._id]);

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
            {errorMessage ||
              "The order or rent record does not exist in your orders."}
          </p>
        </Card>
      </div>
    );
  }

  return (
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

      <OrderDetails
        item={order}
        reviews={userReviews.filter((review) => {
          return order.items.some((item) => item.outfitId === review.outfitID);
        })}
        onReviewSaved={() => {
          if (user?._id) {
            void getUserReviews(user._id);
          }
        }}
      />
    </div>
  );
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
