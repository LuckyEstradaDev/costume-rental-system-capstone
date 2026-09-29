/**
 * Single source of truth for dashboard chart colors.
 *
 * These used to be hardcoded per component, which let unrelated charts drift
 * onto the same purple and made the cards hard to tell apart at a glance. Every
 * non-status series gets its own hue here; the payment-status colors below are
 * reserved for the status pie and must not be reused elsewhere, or an amber
 * "orders" line would read as a pending payment.
 */

export const CHART_COLORS = {
  revenue: "#703c8e",
  signups: "#3b82f6",
  orders: "#f97316",
  rentals: "#14b8a6",
  mostRented: "#0891b2",
  mostBought: "#db2777",
} as const;

/** Payment status is semantic, so these stay fixed rather than rotating. */
export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: "#10b981",
  pending: "#f59e0b",
  refunded: "#6366f1",
  failed: "#ef4444",
};

/** Used when a status has no mapping above, so the slice still reads as purple. */
export const FALLBACK_SERIES_COLORS = [
  CHART_COLORS.revenue,
  CHART_COLORS.mostRented,
  CHART_COLORS.orders,
  CHART_COLORS.mostBought,
];

export const AXIS_TICK_COLOR = "#6b6b6b";
export const GRID_COLOR = "rgba(107,107,107,0.08)";
export const SLICE_BORDER_COLOR = "#fff";

/** Applies the shared opacity the bar charts use for their fills. */
export const withAlpha = (hex: string, alpha: number): string => {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
