"use client";

import {LayoutDashboard} from "lucide-react";
import {StatCard, type StatCardDelta} from "@/components/ui/stat-card";
import {Card} from "@/components/ui/card";
import {formatCurrency, formatReadableDate} from "@/lib/formatters";
import {useDashboardFilters} from "@/features/admin-dashboard/dashboard/hooks/useDashboardFilters";
import {DateRangeDropdown} from "@/features/admin-dashboard/dashboard/components/slicers/DateRangeDropdown";
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
            <LayoutDashboard className="size-6 text-foreground" />
            Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {formatReadableDate(range.from)} – {formatReadableDate(range.to)}
          </p>
        </div>

        <DateRangeDropdown
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
        </DateRangeDropdown>
      </div>

      {/* Top row follows the date window; bottom row is current state and
          ignores it. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Net revenue"
          value={formatCurrency(metrics.netRevenue)}
          ariaBusy={isLoading}
          delta={toDelta(deltas.netRevenue)}
          hint={
            metrics.refunds > 0
              ? `${formatCurrency(metrics.refunds)} refunded`
              : undefined
          }
        />
        <StatCard
          label="Orders placed"
          value={metrics.ordersCount}
          ariaBusy={isLoading}
          delta={toDelta(deltas.orders)}
        />
        <StatCard
          label="Rentals started"
          value={metrics.rentsCount}
          ariaBusy={isLoading}
          delta={toDelta(deltas.rents)}
        />
        <StatCard
          label="New customers"
          value={metrics.newCustomers}
          ariaBusy={isLoading}
          delta={toDelta(deltas.newCustomers)}
        />
        <StatCard
          label="Active rentals"
          value={currentState.activeRentals}
          hint="Current state"
        />
        <StatCard
          label="Overdue rentals"
          value={currentState.overdueRentals}
          hint="Current state"
        />
        <StatCard
          label="Pending orders"
          value={currentState.pendingOrders}
          hint="Current state"
        />
        <StatCard
          label="Total customers"
          value={currentState.totalCustomers}
          hint="All time"
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
