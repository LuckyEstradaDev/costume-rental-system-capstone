"use client";

import {Card} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {AdminOrdersList} from "@/features/admin-dashboard/orders-tab/components/AdminOrdersList";
import {AdminOrdersStats} from "@/features/admin-dashboard/orders-tab/components/AdminOrdersStats";
import {fetchAdminOrdersService} from "@/features/admin-dashboard/orders-tab/services/adminOrderService";
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
      {/* Page Header */}
      <div className="flex flex-col gap-2 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
            <PackageCheck className="size-6 text-foreground" />
            Orders
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isLoading
              ? "Track customer purchases and rentals."
              : `${data.length} record${data.length === 1 ? "" : "s"} — track customer purchases and rentals`}
          </p>
        </div>
      </div>

      <AdminOrdersStats orders={data} />

      {isError && (
        <Card className="p-4 text-destructive">Unable to fetch orders.</Card>
      )}

      {isLoading ? <TableSkeleton /> : <AdminOrdersList orders={data} />}
    </div>
  );
}

function TableSkeleton() {
  return (
    <Card className="gap-0 overflow-hidden rounded-lg border border-border bg-card">
      <div className="divide-y divide-border/50">
        {Array.from({length: 5}).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3.5"
            style={{opacity: 1 - i * 0.15}}
          >
            <Skeleton className="size-12 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5 max-w-52 rounded-md" />
              <Skeleton className="h-3 w-1/3 rounded-md" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="hidden h-4 w-24 rounded-md sm:block" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </Card>
  );
}