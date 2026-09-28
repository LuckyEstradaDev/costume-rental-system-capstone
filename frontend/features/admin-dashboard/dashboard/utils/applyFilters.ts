import type {IOrder} from "@/features/user-dashboard/buy/types/IOrder";
import type {IRent} from "@/features/user-dashboard/rent/types/IRent";
import type {PaymentItem} from "../services/services";
import {buildBuckets, isWithinRange, startOfBucket} from "./dateRange";
import type {DateRange, Granularity} from "../types/filters";

type AnyTransaction = IOrder | IRent;

export interface FilterInput {
  payments: PaymentItem[];
  orders: IOrder[];
  rents: IRent[];
  range: DateRange;
}

export interface FilteredData {
  payments: PaymentItem[];
  orders: IOrder[];
  rents: IRent[];
}

export interface SeriesPoint {
  label: string;
  value: number;
}

/**
 * Revenue is attributed to the moment money actually moved. `paidAt` is set
 * when a payment settles, so it is preferred over the row's creation time.
 */
export const paymentDate = (payment: PaymentItem): Date | null => {
  const value = payment.paidAt ?? payment.createdAt;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const transactionDate = (transaction: AnyTransaction): Date | null => {
  if (!transaction.createdAt) return null;
  const date = new Date(transaction.createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Narrow every collection to the selected window. */
export const applyFilters = (input: FilterInput): FilteredData => ({
  payments: input.payments.filter((payment) =>
    isWithinRange(paymentDate(payment), input.range),
  ),
  orders: input.orders.filter((order) =>
    isWithinRange(transactionDate(order), input.range),
  ),
  rents: input.rents.filter((rent) =>
    isWithinRange(transactionDate(rent), input.range),
  ),
});

/** Allocate a dense, gap-filled value array aligned to `range`'s buckets. */
const allocateBuckets = (range: DateRange, granularity: Granularity) => {
  const buckets = buildBuckets(range, granularity);
  const index = new Map<number, number>(
    buckets.map((bucket, i) => [bucket.start.getTime(), i]),
  );
  return {
    buckets,
    index,
    values: new Array<number>(buckets.length).fill(0) as number[],
  };
};

const toSeries = (
  buckets: {label: string}[],
  values: number[],
): SeriesPoint[] => buckets.map((bucket, i) => ({label: bucket.label, value: values[i]}));

/**
 * Gross revenue = settled payments. Net revenue additionally subtracts refunds.
 * Both are bucketed identically so the chart can toggle between them.
 */
export const revenueSeries = (
  payments: PaymentItem[],
  range: DateRange,
  granularity: Granularity,
  mode: "gross" | "net",
): SeriesPoint[] => {
  const {buckets, index, values} = allocateBuckets(range, granularity);

  for (const payment of payments) {
    const date = paymentDate(payment);
    if (!date) continue;

    const settled = payment.status === "paid";
    const refunded = payment.status === "refunded";
    if (mode === "gross" && !settled) continue;
    if (mode === "net" && !settled && !refunded) continue;

    const position = index.get(startOfBucket(date, granularity).getTime());
    if (position === undefined) continue;

    const amount = Number(payment.totalAmount) || 0;
    values[position] += refunded ? -amount : amount;
  }

  return toSeries(buckets, values);
};

/** Count records per bucket. */
export const countSeries = <T,>(
  records: T[],
  range: DateRange,
  granularity: Granularity,
  getDate: (record: T) => Date | null,
): SeriesPoint[] => {
  const {buckets, index, values} = allocateBuckets(range, granularity);

  for (const record of records) {
    const date = getDate(record);
    if (!date) continue;
    const position = index.get(startOfBucket(date, granularity).getTime());
    if (position === undefined) continue;
    values[position] += 1;
  }

  return toSeries(buckets, values);
};

/**
 * Parse the backend's aggregate key (`%Y-%m-%d`, produced in UTC) as an instant.
 *
 * Caveat, and it is a real one: the aggregate has already discarded the
 * time-of-day, so an exact local-day attribution is not recoverable. Each UTC
 * day is treated as UTC midnight and then bucketed locally. For UTC+8 (PHL)
 * that lands on the same local day, so this is exact for your deployment; the
 * worst case anywhere else is a one-day shift for signups made near midnight.
 */
export const parseAggregateDate = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  const parsed = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day)),
  );
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * New-signups per bucket, re-aggregated from the backend's UTC daily series so
 * it shares the exact same local bucket sequence as every other chart.
 */
export const userSeries = (
  aggregate: {date: string; count: number}[],
  range: DateRange,
  granularity: Granularity,
): SeriesPoint[] => {
  const {buckets, index, values} = allocateBuckets(range, granularity);

  for (const entry of aggregate) {
    const date = parseAggregateDate(entry.date);
    if (!date) continue;
    const position = index.get(startOfBucket(date, granularity).getTime());
    if (position === undefined) continue;
    values[position] += Number(entry.count) || 0;
  }

  return toSeries(buckets, values);
};
