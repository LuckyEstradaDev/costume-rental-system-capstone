import {
  calculateReservationAmount,
  getReservationRefundDeadline,
  isReservationRequested,
  isWithinReservationRefundWindow,
} from "./reservation.js";
import type {ReservationSource} from "./reservation.js";

export const getReservationFeeRefundDeadline = (payment: ReservationSource | null) => {
  const reservation = payment?.reservation;
  if (
    payment?.status === "paid" ||
    payment?.status === "refunded" ||
    !isReservationRequested(payment) ||
    (reservation?.status !== "paid" && reservation?.status !== "forfeited")
  ) {
    return undefined;
  }

  return getReservationRefundDeadline(reservation.paidAt);
};

export const canRefundReservationFee = (payment: ReservationSource | null, now: Date) => {
  const deadline = getReservationFeeRefundDeadline(payment);
  return Boolean(deadline && isWithinReservationRefundWindow(payment, now));
};

export const getRefundableAmount = (
  payment: (ReservationSource & {totalAmount?: number | null}) | null,
  orderTotal: number,
  now = new Date(),
) => {
  if (payment?.status !== "paid") {
    if (!canRefundReservationFee(payment, now)) return 0;

    const fee = payment?.reservation?.amount ?? calculateReservationAmount(orderTotal);
    const feeCents = Math.round(fee * 100);
    return Number.isSafeInteger(feeCents) && feeCents > 0 ? feeCents / 100 : 0;
  }

  const total = payment.totalAmount ?? orderTotal;
  const totalCents = Math.round(total * 100);
  if (!Number.isSafeInteger(totalCents) || totalCents <= 0) return 0;

  if (!isReservationRequested(payment)) return Math.floor(totalCents / 2) / 100;
  const reservation = payment.reservation;
  const reservationWasPaid =
    Boolean(reservation?.paidAt) ||
    reservation?.status === "paid" ||
    reservation?.status === "forfeited" ||
    reservation?.status === "refunded";
  if (!reservationWasPaid) return totalCents / 100;

  const withheld = reservation?.amount ?? calculateReservationAmount(total);
  return Math.max(0, totalCents - Math.round(withheld * 100)) / 100;
};
