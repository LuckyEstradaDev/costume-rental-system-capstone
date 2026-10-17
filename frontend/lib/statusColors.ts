import type {CSSProperties} from "react";

/**
 * Single source of truth for status pill colors.
 *
 * Keys are matched case-insensitively so both the lower-case order/payment
 * statuses (`pending`, `refunded`) and the capitalised security-deposit
 * statuses (`Pending`, `Returned`) resolve to the same swatch.
 */
export const STATUS_COLORS: Record<string, string> = {
  // Order / rental lifecycle
  pending: "#D97706",
  active: "#2563EB",
  received: "#0D9488",
  returned: "#16A34A",
  cancelled: "#DC2626",
  overdue: "#DC2626",

  // Payments
  paid: "#16A34A",
  failed: "#DC2626",
  refunded: "#7C3AED",

  // Security deposit
  held: "#2563EB",
  forfeited: "#DC2626",

  // Security deposit verification
  verified: "#16A34A",
  rejected: "#DC2626",
};

export const getStatusColor = (status?: string | null) => {
  if (!status) {
    return undefined;
  }

  return STATUS_COLORS[status.trim().toLowerCase()];
};

/**
 * Inline style for a solid status pill. Returns `undefined` for unknown or
 * empty statuses so callers can fall back to a neutral badge.
 */
export const getStatusStyle = (
  status?: string | null,
): CSSProperties | undefined => {
  const color = getStatusColor(status);

  if (!color) {
    return undefined;
  }

  return {
    backgroundColor: color,
    borderColor: color,
    color: "#FFFFFF",
  };
};
