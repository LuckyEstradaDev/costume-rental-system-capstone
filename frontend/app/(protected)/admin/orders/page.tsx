"use client";

import {useMemo} from "react";
import {Card} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {AdminOrdersList} from "@/features/admin-dashboard/orders-tab/components/AdminOrdersList";
import {AdminOrdersStats} from "@/features/admin-dashboard/orders-tab/components/AdminOrdersStats";
import {fetchAdminOrdersService} from "@/features/admin-dashboard/orders-tab/services/adminOrderService";
import {useDateWindow} from "@/features/admin-dashboard/dashboard/hooks/useDateWindow";
import {DateRangeDropdown} from "@/features/admin-dashboard/dashboard/components/slicers/DateRangeDropdown";
import {isWithinRange} from "@/features/admin-dashboard/dashboard/utils/dateRange";
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

  const dateWindow = useDateWindow();

  // Both purchases and rentals arrive in one list, and both are dated by when
  // they were placed rather than when the payment settled.
  const visibleOrders = useMemo(
    () => data.filter((order) => isWithinRange(order.createdAt, dateWindow.range)),
    [data, dateWindow.range],
  );

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
              : visibleOrders.length === data.length
                ? `${data.length} record${data.length === 1 ? "" : "s"} — track customer purchases and rentals`
                : `${visibleOrders.length} of ${data.length} records in the selected window`}
          </p>
        </div>

        <DateRangeDropdown
          presetId={dateWindow.presetId}
          range={dateWindow.range}
          customFrom={dateWindow.customFrom}
          customTo={dateWindow.customTo}
          isDefault={dateWindow.isDefault}
          defaultPreset="all"
          onPresetChange={dateWindow.setPreset}
          onCustomFromChange={dateWindow.setCustomFromValue}
          onCustomToChange={dateWindow.setCustomToValue}
          onReset={dateWindow.resetAll}
        />
      </div>

      <AdminOrdersStats orders={visibleOrders} />

      {isError && (
        <Card className="p-4 text-destructive">Unable to fetch orders.</Card>
      )}

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <AdminOrdersList orders={visibleOrders} />
      )}
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