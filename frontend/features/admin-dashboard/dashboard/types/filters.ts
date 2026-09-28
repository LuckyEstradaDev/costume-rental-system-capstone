/**
 * Date model for the admin dashboard.
 *
 * The dashboard fetches every row up front and filters + re-buckets entirely in
 * the browser, so these types describe a *resolved* control state rather than a
 * query.
 */

export type Granularity = "day" | "week" | "month" | "quarter" | "year";

export const GRANULARITIES: readonly Granularity[] = [
  "day",
  "week",
  "month",
  "quarter",
  "year",
] as const;

export const GRANULARITY_LABELS: Record<Granularity, string> = {
  day: "Day",
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "Year",
};

export type WindowPresetId =
  | "7d"
  | "30d"
  | "90d"
  | "thisMonth"
  | "lastMonth"
  | "ytd"
  | "all"
  | "custom";

export type RevenueMode = "gross" | "net";

/** Both bounds inclusive, in browser-local time. */
export interface DateRange {
  from: Date;
  to: Date;
}

export interface DashboardControls {
  presetId: WindowPresetId;
  /** Only read when `presetId === "custom"`. */
  customFrom: Date;
  customTo: Date;
  granularity: Granularity;
}
