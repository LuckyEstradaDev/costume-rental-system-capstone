"use client";

import {Card} from "@/components/ui/card";
import {AdminOrdersList} from "@/features/admin-dashboard/orders-tab/components/AdminOrdersList";
import {AdminOrdersStats} from "@/features/admin-dashboard/orders-tab/components/AdminOrdersStats";
import {fetchAdminOrdersService} from "@/features/admin-dashboard/orders-tab/services/adminOrderService";
import type {AdminOrderItem} from "@/features/admin-dashboard/orders-tab/types/IAdminOrder";
import {PackageCheck} from "lucide-react";
import {useQuery} from "@tanstack/react-query";

export default function AdminOrdersPage() {
  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: fetchAdminOrdersService,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <PackageCheck className="size-4.5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Orders
            </h1>
            <p className="text-sm text-muted-foreground">
              Track customer purchases and rentals.
            </p>
          </div>
        </div>
      </div>

      <AdminOrdersStats orders={data} />

      {isError && (
        <Card className="p-4 text-destructive">Unable to fetch orders.</Card>
      )}

      {isLoading ? (
        <Card className="p-6 text-center text-muted-foreground">
          Loading orders...
        </Card>
      ) : (
        <AdminOrdersList orders={data} />
      )}
    </div>
  );
}
