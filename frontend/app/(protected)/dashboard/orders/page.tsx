"use client";

import {useEffect, useState} from "react";
import {Card} from "@/components/ui/card";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {OrdersFilterTabs} from "@/features/user-dashboard/orders/components/OrdersFilterTabs";
import {OrdersList} from "@/features/user-dashboard/orders/components/OrdersList";
import {OrdersStats} from "@/features/user-dashboard/orders/components/OrdersStats";
import {fetchOrdersByUserIdService} from "@/features/user-dashboard/orders/services/orderService";
import {
  OrderTrackingItem,
  OrderTrackingType,
} from "@/features/user-dashboard/orders/types/IOrderTracking";

export default function OrdersPage() {
  const {user} = useAuth();
  const [activeFilter, setActiveFilter] = useState<OrderTrackingType | "all">(
    "all",
  );
  const [orders, setOrders] = useState<OrderTrackingItem[]>([]); //overall orders and rents alltogether
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?._id) {
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const {data} = await fetchOrdersByUserIdService(user._id);
        setOrders(data.data.orders.concat(data.data.rents)); //combine orders and rents into one array
      } catch {
        setErrorMessage("Unable to fetch orders.");
      }

      setIsLoading(false);
    };

    fetchOrders();
  }, [user]);

  const filteredOrders = orders.filter((item) => {
    if (activeFilter === "all") {
      return true;
    }
    return item.type === activeFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="mt-1 text-muted-foreground">
          Track your costume purchases and rentals.
        </p>
      </div>

      <OrdersStats items={orders} />

      <div className="flex items-center justify-between">
        <OrdersFilterTabs
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>

      {isLoading ? (
        <Card className="p-6 text-center text-muted-foreground">
          Loading orders...
        </Card>
      ) : errorMessage ? (
        <Card className="p-6 text-center text-destructive">{errorMessage}</Card>
      ) : (
        <OrdersList items={filteredOrders} />
      )}
    </div>
  );
}
