"use client";

import {
  calculateReservationAmount,
  formatCurrency,
  formatReadableDate,
  formatStatusLabel,
  getRemainingBalance,
} from "@/lib/formatters";
import type {IOrder} from "../../buy/types/IOrder";
import type {IRent} from "../../rent/types/IRent";
import {METHOD_LABELS, type OnlinePaymentMethod} from "../types/IPaymongo";

export function resolveMethodLabel(method?: string) {
  return (
    METHOD_LABELS[method as OnlinePaymentMethod] ?? formatStatusLabel(method)
  );
}

export function TransactionSummaryCard({
  order,
  paymentIntentId,
}: {
  order: IOrder | IRent;
  paymentIntentId?: string;
}) {
  const items = order.items ?? [];
  const pieceCount = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );
  const isRent = order.type === "rent";
  const reservation = order.payment?.reservation;
  const reservationPaid = reservation?.status === "paid";
  const finalPaymentPaid = order.payment?.status === "paid";
  const reservationAmount = Number(
    reservation?.amount ?? calculateReservationAmount(order.totalAmount),
  );
  const amountDue =
    finalPaymentPaid
      ? order.totalAmount
      : reservation?.requested && reservationPaid
        ? getRemainingBalance(order.totalAmount, reservationAmount)
        : reservation?.requested
          ? reservationAmount
          : order.totalAmount;
  const method =
    reservation?.requested && !reservationPaid
      ? reservation?.method ?? order.payment?.method
      : order.payment?.method ?? reservation?.method;

  const facts = [
    order.referenceID || null,
    isRent ? "Rental" : "Purchase",
    isRent && order.eventDate ? formatReadableDate(order.eventDate) : null,
    pieceCount > 0 ? `${pieceCount} pcs` : null,
    reservation?.requested
      ? finalPaymentPaid
        ? "Payment complete"
        : reservationPaid
          ? "Remaining balance"
          : "Reservation payment (50%)"
      : null,
    method ? resolveMethodLabel(method) : null,
    paymentIntentId || null,
  ].filter(Boolean) as string[];

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="flex min-w-0 flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
        {facts.map((fact) => (
          <span key={fact}>{fact}</span>
        ))}
      </p>
      <p className="shrink-0 text-xl font-bold tracking-tight text-foreground">
        {formatCurrency(amountDue)}
      </p>
    </div>
  );
}