"use client";

import {useState} from "react";
import {Card} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {AlertCircle, ShoppingBag} from "lucide-react";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {OrdersFilterTabs} from "@/features/user-dashboard/orders/components/OrdersFilterTabs";
import {OrdersList} from "@/features/user-dashboard/orders/components/OrdersList";
import {OrdersStats} from "@/features/user-dashboard/orders/components/OrdersStats";
import {fetchOrdersByUserIdService} from "@/features/user-dashboard/orders/services/orderService";
import {IOrder} from "@/features/user-dashboard/buy/types/IOrder";
import {IRent} from "@/features/user-dashboard/rent/types/IRent";
import {useQuery} from "@tanstack/react-query";
import {sortArrayByLatestDate} from "@/lib/helper";

export default function OrdersPage() {
  const {user} = useAuth();
  const [activeFilter, setActiveFilter] = useState<"all" | "purchase" | "rent">(
    "all",
  );
  const {
    data: ordersData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-orders", user?._id],
    queryFn: () => fetchOrdersByUserIdService(user!._id!),
    enabled: Boolean(user?._id),
  });
  const orders: (IRent | IOrder)[] = ordersData
    ? [...ordersData.orders, ...ordersData.rents]
    : [];

  let filteredOrders = orders.filter((item) => {
    if (activeFilter === "all") return true;
    return item.type === activeFilter;
  });

  //sort filteredOrders by earliest date
  filteredOrders = sortArrayByLatestDate(filteredOrders);

  const totalCount = orders.length;
  const purchaseCount = orders.filter((item) => item.type === "purchase").length;
  const rentCount = orders.filter((item) => item.type === "rent").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
            <ShoppingBag className="size-6 text-foreground" />
            My Orders
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {totalCount} transaction{totalCount === 1 ? "" : "s"} — track your
            costume purchases and rentals
          </p>
        </div>
      </div>

      {/* Stats */}
      <OrdersStats items={orders} />

      {/* Filter + List */}
      <div className="space-y-4">
        <OrdersFilterTabs
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={{
            all: totalCount,
            purchase: purchaseCount,
            rent: rentCount,
          }}
        />

        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <ErrorState message="Unable to fetch orders." />
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
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border border-border bg-background p-4"
          style={{opacity: 1 - i * 0.2}}
        >
          <Skeleton className="size-24 shrink-0 rounded-lg" />
          <div className="flex flex-1 flex-col gap-2.5">
            <Skeleton className="h-4 w-2/5 rounded-md" />
            <Skeleton className="h-3 w-1/3 rounded-md" />
            <Skeleton className="h-3 w-1/4 rounded-md" />
          </div>
          <Skeleton className="h-9 w-20 shrink-0 rounded-md" />
        </div>
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
