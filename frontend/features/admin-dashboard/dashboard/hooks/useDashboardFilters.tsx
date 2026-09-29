"use client";

import {useCallback, useMemo, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import type {IOrder} from "@/features/user-dashboard/buy/types/IOrder";
import type {IRent} from "@/features/user-dashboard/rent/types/IRent";
import {
  getAllActiveRentsService,
  getAllOrdersService,
  getAllPaymentsService,
  getUserCountService,
  type PaymentItem,
} from "../services/services";
import {
  applyFilters,
  countSeries,
  paymentDate,
  revenueSeries,
  userSeries,
  type SeriesPoint,
} from "../utils/applyFilters";
import {
  addDays,
  parseDateInputValue,
  previousWindow,
  resolveGranularity,
  resolveWindow,
  startOfDay,
} from "../utils/dateRange";
import type {
  DashboardControls,
  DateRange,
  WindowPresetId,
} from "../types/filters";

export interface Delta {
  current: number;
  previous: number;
  /** `null` when there is no comparable prior period. */
  percent: number | null;
}

const buildDelta = (current: number, previous: number | null): Delta => {
  if (previous === null) {
    return {current, previous: 0, percent: null};
  }
  if (previous === 0) {
    // Growth from zero is unbounded; report it as an increase without a %.
    return {current, previous, percent: current === 0 ? 0 : null};
  }
  return {
    current,
    previous,
    percent: ((current - previous) / Math.abs(previous)) * 100,
  };
};

const sumBy = (payments: PaymentItem[], status: string) =>
  payments
    .filter((payment) => payment.status === status)
    .reduce((total, payment) => total + (Number(payment.totalAmount) || 0), 0);

const DEFAULT_PRESET: WindowPresetId = "30d";

const initialControls = (): DashboardControls => {
  const today = new Date();
  return {
    presetId: DEFAULT_PRESET,
    customFrom: addDays(startOfDay(today), -29),
    customTo: today,
    granularity: "day",
  };
};

/**
 * Single source of truth for the dashboard's date window and everything derived
 * from it. Deliberately no `useEffect`-driven derived state: the window, the
 * filtered rows, the bucket series and the previous-period comparison are all
 * plain memos, so every widget always agrees on what "now" means.
 */
export function useDashboardFilters() {
  const [controls, setControls] = useState<DashboardControls>(initialControls);

  // --- queries ------------------------------------------------------------
  const rentsQuery = useQuery({
    queryKey: ["dashboard-rents"],
    queryFn: getAllActiveRentsService,
  });
  const ordersQuery = useQuery({
    queryKey: ["dashboard-orders"],
    queryFn: getAllOrdersService,
  });
  const usersQuery = useQuery({
    queryKey: ["dashboard-users"],
    queryFn: getUserCountService,
  });
  const paymentsQuery = useQuery({
    // Shared key with /admin/payments — same endpoint, so one cache entry.
    queryKey: ["payments"],
    queryFn: getAllPaymentsService,
  });

  // Stable empty identities, otherwise `?? []` hands every memo a brand new
  // array on each render and nothing downstream can cache.
  const EMPTY_ORDERS = useMemo<IOrder[]>(() => [], []);
  const EMPTY_RENTS = useMemo<IRent[]>(() => [], []);
  const EMPTY_PAYMENTS = useMemo<PaymentItem[]>(() => [], []);
  const EMPTY_AGGREGATE = useMemo<{date: string; count: number}[]>(() => [], []);

  const rents = rentsQuery.data?.allRents ?? EMPTY_RENTS;
  const orders = ordersQuery.data?.allOrders ?? EMPTY_ORDERS;
  const payments = paymentsQuery.data ?? EMPTY_PAYMENTS;
  const userAggregate = usersQuery.data?.data.aggregate ?? EMPTY_AGGREGATE;
  const totalCustomers = usersQuery.data?.data.count ?? 0;

  const isLoading =
    rentsQuery.isLoading ||
    ordersQuery.isLoading ||
    usersQuery.isLoading ||
    paymentsQuery.isLoading;

  // --- window -------------------------------------------------------------
  const dataBounds = useMemo(() => {
    let earliest: Date | null = null;
    let latest: Date | null = null;

    const consider = (value: Date | null | undefined) => {
      if (!value || Number.isNaN(value.getTime())) return;
      if (!earliest || value < earliest) earliest = value;
      if (!latest || value > latest) latest = value;
    };

    for (const payment of payments) consider(paymentDate(payment));
    for (const order of orders) consider(new Date(order.createdAt ?? 0));
    for (const rent of rents) consider(new Date(rent.createdAt ?? 0));

    return {earliest, latest};
  }, [payments, orders, rents]);

  const range: DateRange = useMemo(
    () =>
      resolveWindow(
        controls.presetId,
        controls.customFrom,
        controls.customTo,
        dataBounds,
      ),
    [controls.presetId, controls.customFrom, controls.customTo, dataBounds],
  );

  // --- filtering ----------------------------------------------------------
  const current = useMemo(
    () => applyFilters({payments, orders, rents, range}),
    [payments, orders, rents, range],
  );

  const priorRange = useMemo(() => previousWindow(range), [range]);
  const previous = useMemo(
    () => (priorRange ? applyFilters({payments, orders, rents, range: priorRange}) : null),
    [payments, orders, rents, priorRange],
  );

  // --- series -------------------------------------------------------------
  // A wider window can make the chosen bucket size unreadable, so the rendered
  // granularity is derived rather than read straight off the control state.
  const granularity = useMemo(
    () => resolveGranularity(range, controls.granularity),
    [range, controls.granularity],
  );

  const revenueNet: SeriesPoint[] = useMemo(
    () => revenueSeries(current.payments, range, granularity),
    [current.payments, range, granularity],
  );
  const ordersSeries: SeriesPoint[] = useMemo(
    () =>
      countSeries(current.orders, range, granularity, (o) =>
        o.createdAt ? new Date(o.createdAt) : null,
      ),
    [current.orders, range, granularity],
  );
  const rentsSeries: SeriesPoint[] = useMemo(
    () =>
      countSeries(current.rents, range, granularity, (r) =>
        r.createdAt ? new Date(r.createdAt) : null,
      ),
    [current.rents, range, granularity],
  );
  const usersSeries: SeriesPoint[] = useMemo(
    () => userSeries(userAggregate, range, granularity),
    [userAggregate, range, granularity],
  );

  // New customers follow the window only: the backend only exposes a
  // pre-aggregated daily count, so there is nothing to slice any further.
  const previousNewCustomers = useMemo(
    () =>
      priorRange
        ? userSeries(userAggregate, priorRange, "day").reduce(
            (total, point) => total + point.value,
            0,
          )
        : null,
    [userAggregate, priorRange],
  );

  // --- windowed measures --------------------------------------------------
  // Net is the headline figure, so the card and the chart read this pair
  // together and can never disagree.
  const grossRevenue = sumBy(current.payments, "paid");
  const refunds = sumBy(current.payments, "refunded");
  const netRevenue = grossRevenue - refunds;
  const newCustomers = usersSeries.reduce(
    (total, point) => total + point.value,
    0,
  );

  const deltas = useMemo(
    () => ({
      netRevenue: buildDelta(
        netRevenue,
        previous
          ? sumBy(previous.payments, "paid") - sumBy(previous.payments, "refunded")
          : null,
      ),
      orders: buildDelta(current.orders.length, previous?.orders.length ?? null),
      rents: buildDelta(current.rents.length, previous?.rents.length ?? null),
      newCustomers: buildDelta(newCustomers, previousNewCustomers),
    }),
    [
      netRevenue,
      current.orders.length,
      current.rents.length,
      previous,
      newCustomers,
      previousNewCustomers,
    ],
  );

  // --- current state ------------------------------------------------------
  // Not windowed: "how many rentals are out right now" is not a windowed
  // measure, and `/api/outfits/stats` has no time dimension at all.
  const currentState = useMemo(
    () => ({
      activeRentals: rents.filter((rent) => rent.status === "active").length,
      overdueRentals: rents.filter((rent) => rent.status === "overdue").length,
      pendingOrders: orders.filter((order) => order.status === "pending").length,
      totalCustomers,
    }),
    [rents, orders, totalCustomers],
  );

  // --- mutations ----------------------------------------------------------
  const setPreset = useCallback((presetId: WindowPresetId) => {
    setControls((prev) => ({...prev, presetId}));
  }, []);

  const setGranularity = useCallback((granularity: DashboardControls["granularity"]) => {
    setControls((prev) => ({...prev, granularity}));
  }, []);

  // Typing a date immediately adopts a custom range, so the panel needs no
  // separate "apply" step.
  const setCustomFromValue = useCallback((value: string, fallback: Date) => {
    setControls((prev) => ({
      ...prev,
      presetId: "custom",
      customFrom: parseDateInputValue(value, fallback),
    }));
  }, []);

  const setCustomToValue = useCallback((value: string, fallback: Date) => {
    setControls((prev) => ({
      ...prev,
      presetId: "custom",
      customTo: parseDateInputValue(value, fallback),
    }));
  }, []);

  const resetAll = useCallback(() => setControls(initialControls()), []);

  return {
    controls,
    range,
    priorRange,
    /** Bucket size actually rendered, after any fallback. */
    granularity,
    isLoading,
    /** Rows left after the window is applied. */
    filtered: current,
    series: {
      revenueNet,
      orders: ordersSeries,
      rents: rentsSeries,
      users: usersSeries,
    },
    metrics: {
      refunds,
      netRevenue,
      ordersCount: current.orders.length,
      rentsCount: current.rents.length,
      paymentsCount: current.payments.length,
      newCustomers,
    },
    deltas,
    currentState,
    isDefault: controls.presetId === DEFAULT_PRESET,
    actions: {
      setPreset,
      setGranularity,
      setCustomFromValue,
      setCustomToValue,
      resetAll,
    },
  };
}

export type DashboardFiltersController = ReturnType<typeof useDashboardFilters>;
