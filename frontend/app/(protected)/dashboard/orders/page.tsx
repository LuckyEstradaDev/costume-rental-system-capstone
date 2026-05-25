"use client";

import {useEffect, useState} from "react";
import {Card} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {AlertCircle, ShoppingBag} from "lucide-react";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {OrdersFilterTabs} from "@/features/user-dashboard/orders/components/OrdersFilterTabs";
import {OrdersList} from "@/features/user-dashboard/orders/components/OrdersList";
import {OrdersStats} from "@/features/user-dashboard/orders/components/OrdersStats";
import {
  fetchOrdersByUserIdService,
  mapOrderTrackingItem,
} from "@/features/user-dashboard/orders/services/orderService";
import {
  OrderTrackingItem,
  OrderTrackingType,
} from "@/features/user-dashboard/orders/types/IOrderTracking";
import {useReview} from "@/features/user-dashboard/review/hooks/useReview";

export default function OrdersPage() {
  const {user} = useAuth();
  const [activeFilter, setActiveFilter] = useState<OrderTrackingType | "all">(
    "all",
  );
  const [orders, setOrders] = useState<OrderTrackingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const {getUserReviews} = useReview();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?._id) return;

      setIsLoading(true);
      setErrorMessage("");

      try {
        const {data} = await fetchOrdersByUserIdService(user._id);
        const userOrders = data.data.orders.concat(data.data.rents);
        setOrders(userOrders.map(mapOrderTrackingItem));
        await getUserReviews(user._id);
      } catch {
        setErrorMessage("Unable to fetch orders.");
      }

      setIsLoading(false);
    };

    fetchOrders();
  }, [getUserReviews, user]);

  const filteredOrders = orders.filter((item) => {
    if (activeFilter === "all") return true;
    return item.type === activeFilter;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <ShoppingBag className="size-4.5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              My Orders
            </h1>
            <p className="text-sm text-muted-foreground">
              Track your costume purchases and rentals.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <OrdersStats items={orders} />

      {/* Filter + List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <OrdersFilterTabs
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : errorMessage ? (
          <ErrorState message={errorMessage} />
        ) : (
          <OrdersList items={filteredOrders} />
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({length: 3}).map((_, i) => (
        <Card
          key={i}
          className="border-0 p-5 shadow-sm ring-1 ring-border/60"
          style={{opacity: 1 - i * 0.2}}
        >
          <div className="flex gap-4">
            <Skeleton className="size-20 shrink-0 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2.5">
              <Skeleton className="h-4 w-2/5 rounded-md" />
              <Skeleton className="h-3 w-1/3 rounded-md" />
              <Skeleton className="h-3 w-1/4 rounded-md" />
            </div>
            <Skeleton className="h-8 w-20 shrink-0 rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function ErrorState({message}: {message: string}) {
  return (
    <Card className="border-0 shadow-sm ring-1 ring-destructive/30">
      <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-5 text-destructive" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            Something went wrong
          </p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </Card>
  );
}
