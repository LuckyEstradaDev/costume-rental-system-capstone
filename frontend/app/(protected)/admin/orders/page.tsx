"use client";

import {useEffect, useState} from "react";
import {Card} from "@/components/ui/card";
import {AdminOrdersList} from "@/features/admin-dashboard/orders-tab/components/AdminOrdersList";
import {AdminOrdersStats} from "@/features/admin-dashboard/orders-tab/components/AdminOrdersStats";
import {fetchAdminOrdersService} from "@/features/admin-dashboard/orders-tab/services/adminOrderService";
import type {AdminOrderItem} from "@/features/admin-dashboard/orders-tab/types/IAdminOrder";
import {PackageCheck} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const {data} = await fetchAdminOrdersService();
        const allOrders = data.data.orders.concat(data.data.rents);
        setOrders(allOrders);
      } catch {
        setErrorMessage("Unable to fetch orders.");
      }

      setIsLoading(false);
    };

    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <PackageCheck className="size-4.5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Orders</h1>
            <p className="text-sm text-muted-foreground">Track customer purchases and rentals.</p>
          </div>
        </div>
      </div>

      <AdminOrdersStats orders={orders} />

      {errorMessage && (
        <Card className="p-4 text-destructive">{errorMessage}</Card>
      )}

      {isLoading ? (
        <Card className="p-6 text-center text-muted-foreground">
          Loading orders...
        </Card>
      ) : (
        <AdminOrdersList orders={orders} />
      )}
    </div>
  );
}
