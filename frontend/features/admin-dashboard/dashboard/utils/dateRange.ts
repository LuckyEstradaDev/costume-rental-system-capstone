import {
  GRANULARITIES,
  type DateRange,
  type Granularity,
  type WindowPresetId,
} from "../types/filters";

/** Truncate a date to the start of its local day. */
export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Local midnight at the end of the given day (the last representable instant). */
export const endOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/** Sunday-based week start, matching `Date.prototype.getDay()`. */
export const startOfWeek = (date: Date): Date => {
  const day = startOfDay(date);
  day.setDate(day.getDate() - day.getDay());
  return day;
};

export const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const startOfQuarter = (date: Date): Date =>
  new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1);

export const startOfYear = (date: Date): Date =>
  new Date(date.getFullYear(), 0, 1);

/** Truncate a date down to the start of the bucket that contains it. */
export const startOfBucket = (date: Date, granularity: Granularity): Date => {
  switch (granularity) {
    case "day":
      return startOfDay(date);
    case "week":
      return startOfWeek(date);
    case "month":
      return startOfMonth(date);
    case "quarter":
      return startOfQuarter(date);
    case "year":
      return startOfYear(date);
  }
};

/** Advance a bucket start by exactly one bucket. */
export const addBucket = (
  start: Date,
  granularity: Granularity,
): Date => {
  const next = new Date(start);
  switch (granularity) {
    case "day":
      next.setDate(next.getDate() + 1);
      break;
    case "week":
      next.setDate(next.getDate() + 7);
      break;
    case "month":
      next.setMonth(next.getMonth() + 1);
      break;
    case "quarter":
      next.setMonth(next.getMonth() + 3);
      break;
    case "year":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
};

const shortMonthWithYear = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "2-digit",
});

/** Human label for a bucket start. Must be unique within a single chart. */
export const bucketLabel = (
  start: Date,
  granularity: Granularity,
): string => {
  switch (granularity) {
    case "day":
      return start.toLocaleDateString();
    case "week":
      return `Wk ${start.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })}`;
    case "month":
      return shortMonthWithYear.format(start);
    case "quarter":
      return `Q${Math.floor(start.getMonth() / 3) + 1} ${start.getFullYear()}`;
    case "year":
      return String(start.getFullYear());
  }
};

export const MAX_BUCKETS = 366;

/**
 * How many buckets a range spans, giving up once the answer is obviously past
 * `MAX_BUCKETS`. The early exit matters: an unbounded "all time" range at daily
 * granularity is ~50k buckets, and this runs on every render of the slicer bar.
 */
export const countBuckets = (range: DateRange, granularity: Granularity) => {
  let cursor = startOfBucket(range.from, granularity);
  const last = startOfBucket(range.to, granularity);
  let count = 0;
  while (cursor.getTime() <= last.getTime() && count <= MAX_BUCKETS) {
    count += 1;
    cursor = addBucket(cursor, granularity);
  }
  return count;
};

export const isGranularityUsable = (
  range: DateRange,
  granularity: Granularity,
) => countBuckets(range, granularity) <= MAX_BUCKETS;

/**
 * The granularity actually used for rendering.
 *
 * A window change can make the selected granularity unreadable (daily points
 * across "all time"). Rather than silently truncating the series, fall back to
 * the coarsest bucket size that still fits — so the charts and the segmented
 * control always agree.
 */
export const resolveGranularity = (
  range: DateRange,
  preferred: Granularity,
): Granularity => {
  if (isGranularityUsable(range, preferred)) {
    return preferred;
  }

  for (const granularity of [...GRANULARITIES].reverse()) {
    if (isGranularityUsable(range, granularity)) {
      return granularity;
    }
  }

  // Even yearly overflows: the range is centuries wide. Year is still the most
  // readable answer, and `buildBuckets` caps the series length.
  return "year";
};

export interface Bucket {
  start: Date;
  label: string;
}

/** Every bucket in `range`, ascending, including empty ones. */
export const buildBuckets = (
  range: DateRange,
  granularity: Granularity,
): Bucket[] => {
  const buckets: Bucket[] = [];
  let cursor = startOfBucket(range.from, granularity);
  const last = startOfBucket(range.to, granularity);

  while (cursor.getTime() <= last.getTime() && buckets.length < MAX_BUCKETS) {
    buckets.push({start: cursor, label: bucketLabel(cursor, granularity)});
    cursor = addBucket(cursor, granularity);
  }

  return buckets;
};

export interface WindowPresetDefinition {
  id: WindowPresetId;
  label: string;
  /** `null` means "derive from the data bounds" (all time). */
  resolve: (now: Date) => DateRange | null;
}

export const WINDOW_PRESETS: readonly WindowPresetDefinition[] = [
  {
    id: "7d",
    label: "Last 7 days",
    resolve: (now) => ({from: addDays(startOfDay(now), -6), to: endOfDay(now)}),
  },
  {
    id: "30d",
    label: "Last 30 days",
    resolve: (now) => ({from: addDays(startOfDay(now), -29), to: endOfDay(now)}),
  },
  {
    id: "90d",
    label: "Last 90 days",
    resolve: (now) => ({from: addDays(startOfDay(now), -89), to: endOfDay(now)}),
  },
  {
    id: "thisMonth",
    label: "This month",
    resolve: (now) => ({from: startOfMonth(now), to: endOfDay(now)}),
  },
  {
    id: "lastMonth",
    label: "Last month",
    resolve: (now) => {
      const firstOfThisMonth = startOfMonth(now);
      const lastOfPrevMonth = new Date(
        firstOfThisMonth.getFullYear(),
        firstOfThisMonth.getMonth(),
        0,
      );
      return {from: startOfMonth(lastOfPrevMonth), to: endOfDay(lastOfPrevMonth)};
    },
  },
  {
    id: "ytd",
    label: "Year to date",
    resolve: (now) => ({from: startOfYear(now), to: endOfDay(now)}),
  },
  {
    id: "all",
    label: "All time",
    resolve: () => null,
  },
  {
    id: "custom",
    label: "Custom",
    resolve: () => null,
  },
] as const;

/**
 * Turn the preset + any custom bounds into a concrete range.
 *
 * `dataBounds` is the earliest/latest record timestamp and only matters for
 * "all time", where there is no natural lower bound.
 */
export const resolveWindow = (
  presetId: WindowPresetId,
  customFrom: Date,
  customTo: Date,
  dataBounds: {earliest: Date | null; latest: Date | null},
  now: Date = new Date(),
): DateRange => {
  const preset = WINDOW_PRESETS.find((item) => item.id === presetId);

  if (presetId === "custom") {
    const from = startOfDay(customFrom);
    const to = endOfDay(customTo);
    // Guard against an inverted range from a partially-typed custom form.
    return to.getTime() < from.getTime() ? {from, to: endOfDay(from)} : {from, to};
  }

  if (presetId === "all") {
    if (!dataBounds.earliest) {
      // No data bounds to work from. Fall back to a wide sentinel range rather
      // than collapsing "all time" to today, which would silently hide rows on
      // list pages that have no aggregate endpoint to derive bounds from.
      return {from: new Date(1970, 0, 1), to: new Date(2100, 0, 1)};
    }
    return {
      from: startOfDay(dataBounds.earliest),
      to: endOfDay(dataBounds.latest ?? now),
    };
  }

  return preset?.resolve(now) ?? {from: startOfDay(now), to: endOfDay(now)};
};

/**
 * The equal-length window immediately preceding `range`, used for
 * compare-to-previous-period deltas. Returns `null` for all-time windows,
 * which have no meaningful predecessor.
 */
export const previousWindow = (range: DateRange): DateRange | null => {
  const spanMs = endOfDay(range.to).getTime() - startOfDay(range.from).getTime();
  if (!Number.isFinite(spanMs) || spanMs < 0) {
    return null;
  }

  const previousTo = new Date(startOfDay(range.from).getTime() - 1);
  const previousFrom = new Date(previousTo.getTime() - spanMs);
  return {from: startOfDay(previousFrom), to: endOfDay(previousTo)};
};

/**
 * Inclusive bounds check. Accepts the loose timestamp shapes that come off the
 * API (ISO string, epoch, `Date`) and treats an absent value as out of range,
 * so a row with no date drops out of any bounded window rather than sliding in.
 */
export const isWithinRange = (
  value: Date | string | number | null | undefined,
  range: DateRange,
): boolean => {
  if (value === null || value === undefined || value === "") {
    return false;
  }

  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();
  return Number.isFinite(time) && time >= range.from.getTime() && time <= range.to.getTime();
};

/** `yyyy-mm-dd` for `<input type="date">` round-tripping, in local time. */
export const toDateInputValue = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

/** Parse `yyyy-mm-dd` as local midnight (avoids the UTC shift of `new Date(str)`). */
export const parseDateInputValue = (value: string, fallback: Date): Date => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return fallback;
  }
  const [, year, month, day] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};
