"use client";

import {formatCurrency, formatStatusLabel} from "@/lib/formatters";
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

  const facts = [
    order.referenceID || null,
    isRent
      ? `Rental${order.rentalDays ? ` · ${order.rentalDays}d` : ""}`
      : "Purchase",
    pieceCount > 0 ? `${pieceCount} pcs` : null,
    order.payment?.method ? resolveMethodLabel(order.payment.method) : null,
    paymentIntentId || null,
  ].filter(Boolean) as string[];

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="min-w-0 text-xs text-muted-foreground">
        {facts.map((fact, index) => (
          <span key={fact}>
            {index > 0 && <span className="px-1.5 text-border">·</span>}
            {fact}
          </span>
        ))}
      </p>
      <p className="shrink-0 text-xl font-bold tracking-tight text-foreground">
        {formatCurrency(order.totalAmount)}
      </p>
    </div>
  );
}