"use client";

import type {ReactNode} from "react";
import {LayoutDashboard} from "lucide-react";
import {StatCard, type StatCardDelta} from "@/components/ui/stat-card";
import {
  CalendarCheck,
  Hourglass,
  Wallet,
  WarningCircle,
} from "@/components/ui/stat-icons";
import {Card} from "@/components/ui/card";
import {cn} from "@/lib/utils";
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

const plural = (count: number, singular: string, pluralForm = `${singular}s`) =>
  `${count.toLocaleString()} ${count === 1 ? singular : pluralForm}`;

function SectionHeading({children}: {children: ReactNode}) {
  return (
    <h2 className="text-xl font-semibold text-primary md:text-2xl">
      {children}
    </h2>
  );
}

/**
 * A chart panel on the muted (cream) surface instead of a plain white box.
 * The coloured dot gives each panel its own identity from the palette, and an
 * optional key figure sits opposite the title.
 */
function ChartCard({
  title,
  description,
  dotClassName,
  figure,
  className,
  children,
}: {
  title: ReactNode;
  description: string;
  dotClassName: string;
  figure?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={cn("gap-0 rounded-lg bg-card p-5 ring-1 ring-border/60", className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-primary">
            <span
              aria-hidden
              className={cn("size-2.5 shrink-0 rounded-full", dotClassName)}
            />
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {figure ? (
          <p className="text-2xl font-semibold text-primary tabular-nums">
            {figure}
          </p>
        ) : null}
      </div>
      {children}
    </Card>
  );
}

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

  const overdue = Number(currentState.overdueRentals) || 0;
  const pending = Number(currentState.pendingOrders) || 0;
  const attentionParts = [
    overdue > 0 ? `${plural(overdue, "overdue rental")}` : null,
    pending > 0 ? `${plural(pending, "pending order")}` : null,
  ].filter(Boolean);

  return (
    // `pt-10` reserves the lane the `fixed` slicer chip floats in, so the first
    // row of cards starts below it rather than under it.
    <div className="space-y-8">
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

      {/* Overview: the strip below only appears when something needs action,
          so its mere presence is the signal. */}
          
      <section className="space-y-4">
        <SectionHeading>Overview</SectionHeading>

        {/* {!isLoading && attentionParts.length > 0 ? (
          <div
            role="status"
            className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-accent px-5 py-4 text-accent-foreground"
          >
            <span className="font-semibold">Needs attention</span>
            <span>{attentionParts.join(" · ")}</span>
          </div>
        ) : null} */}

        {/* Net revenue is the headline number, so it owns a 2x2 block while the
            three current-state cards fill the space around it. Only Net revenue
            follows the date window; the current-state cards ignore it. */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Net revenue"
            value={formatCurrency(metrics.netRevenue)}
            context="Settled payments, refunds excluded"
            icon={<Wallet />}
            isLoading={isLoading}
            delta={toDelta(deltas.netRevenue)}
            size="lg"
            className="col-span-2 row-span-2 sm:h-auto"
          />
          <StatCard
            label="Active rentals"
            value={currentState.activeRentals}
            context="Out with customers"
            icon={<CalendarCheck />}
            isLoading={isLoading}
          />
          <StatCard
            label="Overdue rentals"
            value={currentState.overdueRentals}
            context="Past their return date"
            icon={<WarningCircle />}
            isLoading={isLoading}
            needsAttention={overdue > 0}
          />
          <StatCard
            label="Pending orders"
            value={currentState.pendingOrders}
            context="Waiting to be processed"
            icon={<Hourglass />}
            isLoading={isLoading}
            needsAttention={pending > 0}
            className="col-span-2"
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading>Performance</SectionHeading>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <ChartCard
            title="Net revenue"
            description="Settled payments (refunded excluded)"
            dotClassName="bg-accent"
            figure={formatCurrency(metrics.netRevenue)}
            className="xl:col-span-2"
          >
            <div className="h-64">
              <RevenueChart series={series.revenueNet} />
            </div>
          </ChartCard>

          <ChartCard
            title="New signups"
            description="Customer registrations in this range"
            dotClassName="bg-primary"
          >
            <div className="h-64">
              <UsersOvertimeChart series={series.users} />
            </div>
          </ChartCard>

          <ChartCard
            title="Orders & rentals"
            description="Activity in this range"
            dotClassName="bg-secondary"
            className="xl:col-span-2"
          >
            <div className="h-64">
              <Orders_RentsChart orders={series.orders} rents={series.rents} />
            </div>
          </ChartCard>

          <ChartCard
            title="Payments"
            description="Status distribution in this range"
            dotClassName="bg-accent"
          >
            <div className="h-64">
              <PaymentStatusPieChart payments={filtered.payments} />
            </div>
          </ChartCard>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading>Top outfits</SectionHeading>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard
            title="Most rented"
            description="By completed rentals"
            dotClassName="bg-primary"
          >
            <div className="h-64">
              <MostRentedOutfitChart rents={filtered.rents} />
            </div>
          </ChartCard>

          <ChartCard
            title="Most bought"
            description="By purchases"
            dotClassName="bg-secondary"
          >
            <div className="h-64">
              <MostBoughtOutfitChart orders={filtered.orders} />
            </div>
          </ChartCard>
        </div>
      </section>
    </div>
  );
}