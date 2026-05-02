"use client";

import {useEffect, useState} from "react";
import {Card} from "@/components/ui/card";
import {AdminOrdersList} from "@/features/admin-dashboard/orders-tab/components/AdminOrdersList";
import {AdminOrdersStats} from "@/features/admin-dashboard/orders-tab/components/AdminOrdersStats";
import {
  fetchAdminOrdersService,
  updateAdminOrderStatusService,
} from "@/features/admin-dashboard/orders-tab/services/adminOrderService";
import type {
  AdminOrderItem,
  AdminOrderStatus,
} from "@/features/admin-dashboard/orders-tab/types/IAdminOrder";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState("");

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

  const handleStatusChange = async (
    order: AdminOrderItem,
    status: AdminOrderStatus,
  ) => {
    setUpdatingOrderId(order._id);
    setErrorMessage("");

    try {
      const {data} = await updateAdminOrderStatusService(order._id, status);
      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder._id === order._id
            ? {...data.data, user: currentOrder.user}
            : currentOrder,
        ),
      );
    } catch {
      setErrorMessage("Unable to update order status.");
    }

    setUpdatingOrderId("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="mt-1 text-muted-foreground">
          Track customer purchases and rentals.
        </p>
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
        <AdminOrdersList
          orders={orders}
          updatingOrderId={updatingOrderId}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
