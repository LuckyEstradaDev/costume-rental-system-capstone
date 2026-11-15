/**
 * Single source of truth for dashboard chart colors.
 *
 * These used to be hardcoded per component, which let unrelated charts drift
 * onto the same hue and made the cards hard to tell apart at a glance. Every
 * non-status series gets its own shade here; the payment-status colors below
 * are reserved for the status pie and must not be reused elsewhere, or an
 * amber "orders" line would read as a pending payment.
 *
 * The series colors are drawn from the brand palette (brown, navy, gold) so
 * the charts read as part of the admin rather than a separate widget set.
 */

export const CHART_COLORS = {
  revenue: "#4a342c",
  signups: "#243b53",
  orders: "#b07a2a",
  rentals: "#806b5c",
  mostRented: "#5c4a3f",
  mostBought: "#d6b477",
} as const;

/** Payment status is semantic, so these stay fixed rather than rotating. */
export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: "#10b981",
  pending: "#f59e0b",
  refunded: "#6366f1",
  failed: "#ef4444",
};

/** Used when a status has no mapping above, so the slice still reads as brand. */
export const FALLBACK_SERIES_COLORS = [
  CHART_COLORS.revenue,
  CHART_COLORS.mostRented,
  CHART_COLORS.orders,
  CHART_COLORS.mostBought,
];

export const AXIS_TICK_COLOR = "#806b5c";
export const GRID_COLOR = "rgba(128,107,92,0.12)";
export const SLICE_BORDER_COLOR = "#fff";

/** Applies the shared opacity the bar charts use for their fills. */
export const withAlpha = (hex: string, alpha: number): string => {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
