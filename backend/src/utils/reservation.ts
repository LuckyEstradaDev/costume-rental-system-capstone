import type {IReservation} from "../interfaces/IPayment.js";

export const RESERVATION_RATE = 0.5;
export const RESERVATION_WINDOW_HOURS = 24;
export const RESERVATION_REFUND_WINDOW_DAYS = 7;

export type ReservationSource = {
  status?: string | null;
  reservation?: {
    requested?: boolean | null;
    amount?: number | null;
    method?: string | null;
    status?: string | null;
    deadlineAt?: Date | null;
    paidAt?: Date | null;
    refundableUntil?: Date | null;
    paymentIntentId?: string | null;
    stockDeducted?: boolean | null;
  } | null;
};

const roundMoney = (value: number) =>
  Math.round((Number(value) || 0) * 100) / 100;

export const calculateReservationAmount = (totalAmount: number) =>
  roundMoney(totalAmount * RESERVATION_RATE);

export const buildReservation = (
  payment: ReservationSource,
  totalAmount: number,
  createdAt = new Date(),
): IReservation | undefined => {
  if (!payment.reservation?.requested) {
    return undefined;
  }

  return {
    requested: true,
    amount: calculateReservationAmount(totalAmount),
    ...(payment.reservation.method ? {method: payment.reservation.method} : {}),
    status: "pending",
    ...(payment.reservation.method === "cash"
      ? {}
      : {
          deadlineAt: new Date(
            createdAt.getTime() + RESERVATION_WINDOW_HOURS * 60 * 60 * 1000,
          ),
        }),
  };
};

export const isReservationRequested = (
  payment?: ReservationSource | null,
) => payment?.reservation?.requested === true;

export const isReservationPaid = (payment?: ReservationSource | null) =>
  isReservationRequested(payment) && payment?.reservation?.status === "paid";

export const isCashReservationApproved = (payment?: ReservationSource | null) =>
  isReservationRequested(payment) &&
  payment?.reservation?.method === "cash" &&
  payment.reservation.status === "approved";

export const TERMINAL_RESERVATION_STATUSES = [
  "paid",
  "expired",
  "refunded",
  "forfeited",
];

export const isReservationTerminal = (payment?: ReservationSource | null) =>
  isReservationRequested(payment) &&
  TERMINAL_RESERVATION_STATUSES.includes(payment?.reservation?.status ?? "");

export const getRemainingBalance = (
  payment: ReservationSource | null | undefined,
  totalAmount: number,
) => {
  const reservedAmount = isReservationPaid(payment)
    ? Number(payment?.reservation?.amount ?? 0)
    : 0;

  return roundMoney(Math.max(Number(totalAmount || 0) - reservedAmount, 0));
};

export const isWithinReservationRefundWindow = (
  payment?: ReservationSource | null,
  now = new Date(),
) => {
  if (!isReservationPaid(payment)) {
    return false;
  }

  const refundableUntil = payment?.reservation?.refundableUntil;

  if (!refundableUntil) {
    return true;
  }

  return now.getTime() <= new Date(refundableUntil).getTime();
};

export const hasReservationExpired = (
  payment?: ReservationSource | null,
  now = new Date(),
) => {
  if (!isReservationRequested(payment)) {
    return false;
  }

  const deadlineAt = payment?.reservation?.deadlineAt;

  return deadlineAt ? now.getTime() > new Date(deadlineAt).getTime() : false;
};

export const matchesReservationIntent = (
  payment?: ReservationSource | null,
  intentId?: string,
) => Boolean(intentId && payment?.reservation?.paymentIntentId === intentId);
