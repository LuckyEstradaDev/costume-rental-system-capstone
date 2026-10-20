"use client";

import {LayoutDashboard} from "lucide-react";
import {StatCard, type StatCardDelta} from "@/components/ui/stat-card";
import {Card} from "@/components/ui/card";
import {formatCurrency} from "@/lib/formatters";
import {useDashboardFilters} from "@/features/admin-dashboard/dashboard/hooks/useDashboardFilters";
import {AdminPageHeader, AdminPageTitle} from "@/features/admin-dashboard/components/AdminPageHeader";
import {DateRangeSlicer} from "@/features/admin-dashboard/dashboard/components/slicers/DateRangeSlicer";
import {GranularitySlicer} from "@/features/admin-dashboard/dashboard/components/slicers/GranularitySlicer";
import Orders_RentsChart from "@/features/admin-dashboard/dashboard/components/Orders_RentsChart";
import PaymentStatusPieChart from "@/features/admin-dashboard/dashboard/components/PaymentStatusPieChart";
import RevenueChart from "@/features/admin-dashboard/dashboard/components/RevenueChart";
import UsersOvertimeChart from "@/features/admin-dashboard/dashboard/components/UsersOvertimeChart";
import {
  MostBoughtOutfitChart,
  MostRentedOutfitChart,
} from "@/features/admin-dashboard/dashboard/components/RentalBarChart";

const toDelta = (
  delta: {current: number; percent: number | null; previous: number},
): StatCardDelta => ({
  current: delta.current,
  percent: delta.percent,
  previous: delta.previous,
  hasPrevious: delta.previous > 0 || delta.current === 0,
});

export default function AdminDashboardPage() {
  const {
    controls,
    range,
    granularity,
    series,
    metrics,
    deltas,
    currentState,
    filtered,
    isLoading,
    isDefault,
    actions,
  } = useDashboardFilters();

  return (
    // `pt-10` reserves the lane the `fixed` slicer chip floats in, so the first
    // row of cards starts below it rather than under it.
    <div className="space-y-6 pt-10">
      <AdminPageHeader
        title={
          <AdminPageTitle icon={LayoutDashboard}>Dashboard</AdminPageTitle>
        }
        description="Revenue, orders, and customer activity at a glance."
      />
      <DateRangeSlicer
        presetId={controls.presetId}
        range={range}
        customFrom={controls.customFrom}
        customTo={controls.customTo}
        isDefault={isDefault}
        defaultPreset="30d"
        onPresetChange={actions.setPreset}
        onCustomFromChange={actions.setCustomFromValue}
        onCustomToChange={actions.setCustomToValue}
        onReset={actions.resetAll}
      >
        <p className="text-sm font-medium">Group charts by</p>
        <GranularitySlicer
          value={granularity}
          range={range}
          onChange={actions.setGranularity}
        />
      </DateRangeSlicer>

      {/* Net revenue is the headline number, so it owns a 2x2 block while the
          three current-state cards fill the space around it. Only Net revenue
          follows the date window; the current-state cards ignore it. */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Net revenue"
          value={formatCurrency(metrics.netRevenue)}
          isLoading={isLoading}
          delta={toDelta(deltas.netRevenue)}
          inlineDelta
          size="lg"
          className="col-span-2 row-span-2 sm:h-auto"
        />
        <StatCard
          label="Active rentals"
          value={currentState.activeRentals}
          isLoading={isLoading}
        />
        <StatCard
          label="Overdue rentals"
          value={currentState.overdueRentals}
          isLoading={isLoading}
        />
        <StatCard
          label="Pending orders"
          value={currentState.pendingOrders}
          isLoading={isLoading}
          className="col-span-2"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="gap-0 p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Net revenue</h2>
              <p className="text-sm text-muted-foreground">
                Settled payments, less refunds
              </p>
            </div>
            <p className="text-lg font-bold tabular-nums">
              {formatCurrency(metrics.netRevenue)}
            </p>
          </div>
          <div className="h-64">
            <RevenueChart series={series.revenueNet} />
          </div>
        </Card>

        <Card className="gap-0 p-5">
          <h2 className="font-semibold">New signups</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Customer registrations in this range
          </p>
          <div className="h-64">
            <UsersOvertimeChart series={series.users} />
          </div>
        </Card>
      </div>

      <Card className="gap-0 p-5">
        <h2 className="font-semibold">Orders &amp; rentals</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Activity in this range
        </p>
        <div className="h-64">
          <Orders_RentsChart orders={series.orders} rents={series.rents} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="gap-0 p-5">
          <h2 className="font-semibold">Payments</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Status distribution in this range
          </p>
          <div className="h-56">
            <PaymentStatusPieChart payments={filtered.payments} />
          </div>
        </Card>

        <Card className="gap-0 p-5">
          <h2 className="font-semibold">Most rented outfits</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            By completed rentals
          </p>
          <div className="h-56">
            <MostRentedOutfitChart rents={filtered.rents} />
          </div>
        </Card>

        <Card className="gap-0 p-5">
          <h2 className="font-semibold">Most bought outfits</h2>
          <p className="mb-4 text-sm text-muted-foreground">By purchases</p>
          <div className="h-56">
            <MostBoughtOutfitChart orders={filtered.orders} />
          </div>
        </Card>
      </div>
    </div>
  );
}
