"use client";

import Image from "next/image";
import {type ReactNode} from "react";
import {
  StarIcon,
  Receipt,
  Package,
  ShoppingBag,
  CalendarClock,
  CalendarDays,
  Clock,
  CreditCard,
  Hourglass,
  Undo2,
  Wallet,
  PencilIcon,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {
  formatCurrency,
  formatReadableDateTime,
  formatStatusLabel,
} from "@/lib/formatters";
import {getSafeOrderImageSrc} from "../utils/image";
import {ReviewModal} from "../../review/components/ReviewModal";
import {IReview} from "../../review/types/IReview";
import {IOrder} from "../../buy/types/IOrder";
import {IRent} from "../../rent/types/IRent";

export function OrderDetails({
  item,
  reviews = [],
  onReviewSaved,
}: {
  item: IRent | IOrder;
  reviews?: IReview[];
  onReviewSaved?: () => void;
}) {
  const canLeaveReview =
    item.status === "returned" || item.status === "received";

  return (
    <div className="space-y-4 font-[family-name:var(--font-geist-sans)]">
      {/* Transaction Details Card */}
      <Card className="overflow-hidden border-0 bg-card shadow-sm ring-1 ring-border/60">
        {/* Card Header */}
        <div className="flex items-center gap-3 border-b border-border/50 bg-muted/30 px-5 py-3.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
            <Receipt className="size-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Transaction Details
          </h3>
        </div>

        <div className="p-5">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <QuickFact
              icon={item.type === "rent" ? CalendarClock : ShoppingBag}
              label="Type"
              value={item.type === "rent" ? "Rental" : "Purchase"}
            />
            <QuickFact
              icon={CreditCard}
              label="Payment method"
              value={formatStatusLabel(item.payment?.method)}
            />
            <QuickFact
              icon={Wallet}
              label="Payment status"
              value={<PaymentStatusBadge status={item.payment?.status} />}
            />
            <QuickFact
              icon={Clock}
              label={item.type === "rent" ? "Placed rent" : "Placed order"}
              value={formatReadableDateTime(item.createdAt)}
            />

            {item.type === "rent" && (
              <>
                <QuickFact
                  icon={CalendarDays}
                  label="Rental duration"
                  value={`${item.rentalDays} ${item.rentalDays === 1 ? "day" : "days"}`}
                />
                <QuickFact
                  icon={Undo2}
                  label="Pickup time"
                  value={
                    item.pickupTime
                      ? formatReadableDateTime(item.pickupTime)
                      : "Not picked up yet"
                  }
                />
                <QuickFact
                  icon={Hourglass}
                  label="Due date"
                  value={
                    item.duedate
                      ? formatReadableDateTime(item.duedate)
                      : "Not available yet"
                  }
                />
                <QuickFact
                  icon={CalendarClock}
                  label="Return time"
                  value={
                    item.returnTime
                      ? formatReadableDateTime(item.returnTime)
                      : "Not returned yet"
                  }
                />
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Items Card */}
      <Card className="overflow-hidden border-0 bg-card shadow-sm ring-1 ring-border/60">
        <div className="flex items-center gap-2.5 border-b border-border/50 bg-muted/30 px-5 py-3.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
            <Package className="size-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Order items
          </h3>
          <span className="ml-auto text-xs text-muted-foreground">
            {item.items.length} {item.items.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="divide-y divide-border/50">
          {item.items.map((orderItem, index) => {
            const unitPrice = Number(
              item.type === "rent"
                ? orderItem.rentalPrice ?? orderItem.price
                : orderItem.price,
            );
            const itemTotal = unitPrice * orderItem.quantity;
            const review = reviews.find(
              (r) => r.outfitID === orderItem.outfitId,
            );

            return (
              <div
                key={index}
                className="group flex gap-4 p-4 transition-colors hover:bg-muted/20 sm:p-5"
              >
                {/* Product image */}
                <div className="relative size-20 shrink-0 overflow-hidden rounded-[10px] bg-muted ring-1 ring-border/40 sm:size-[88px]">
                  <Image
                    src={getSafeOrderImageSrc(orderItem.imageURL)}
                    alt={orderItem.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Product info */}
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  {/* Name + total */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate text-sm font-semibold leading-snug text-foreground">
                          {orderItem.name}
                        </p>
                        <Badge
                          variant="secondary"
                          className="rounded-full px-2 py-0 text-[11px] font-medium"
                        >
                          {orderItem.category}
                        </Badge>
                      </div>
                      {/* Attribute pills */}
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <Badge
                          variant="outline"
                          className="rounded-full px-2 py-0 text-[11px] font-normal text-muted-foreground"
                        >
                          Size {orderItem.size}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="rounded-full px-2 py-0 text-[11px] font-normal text-muted-foreground"
                        >
                          {orderItem.color}
                        </Badge>
                      </div>
                    </div>

                    {/* Item total */}
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] text-muted-foreground">
                        Item total
                      </p>
                      <p className="mt-0.5 text-[15px] font-semibold tabular-nums text-foreground">
                        {formatCurrency(itemTotal)}
                      </p>
                    </div>
                  </div>

                  {/* Qty × unit price */}
                  <p className="text-xs text-muted-foreground">
                    {orderItem.quantity} ×{" "}
                    {formatCurrency(unitPrice)}
                  </p>

                  {/* Review preview */}
                  {review && <ReviewPreview review={review} />}

                  {/* Action row */}
                  {canLeaveReview && (
                    <div className="mt-1 flex justify-end">
                      <ReviewModal
                        outfitID={orderItem.outfitId}
                        orderID={item._id!}
                        review={review}
                        onReviewSaved={onReviewSaved}
                        trigger={
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1.5 rounded-md px-2.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
                          >
                            {review ? (
                              <>
                                <PencilIcon className="size-3" />
                                Edit review
                              </>
                            ) : (
                              <>
                                <StarIcon className="size-3" />
                                Leave a review
                              </>
                            )}
                          </Button>
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type QuickFactProps = {
  label: string;
  value: ReactNode;
  icon: typeof Clock;
};

function QuickFact({label, value, icon: Icon}: QuickFactProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 px-3.5 py-3">
      <div className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium leading-snug text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

function PaymentStatusBadge({status}: {status?: string}) {
  const variant: "default" | "secondary" | "destructive" | "outline" =
    status === "paid"
      ? "default"
      : status === "failed"
        ? "destructive"
        : status === "refunded"
          ? "secondary"
          : "outline";

  return <Badge variant={variant}>{formatStatusLabel(status)}</Badge>;
}

function ReviewPreview({review}: {review: IReview}) {
  return (
    <div className="relative mt-2.5 w-full overflow-hidden rounded-xl border border-border bg-surface-2 p-4">
      {/* Amber accent top bar */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-300" />

      {/* Stars */}
      <div
        className="flex items-center gap-1.5"
        aria-label={`${review.stars} out of 5 stars`}
      >
        <div className="flex gap-0.5">
          {Array.from({length: 5}).map((_, index) => {
            const isFilled = index < review.stars;
            return (
              <StarIcon
                key={index}
                className={
                  isFilled
                    ? "size-3.5 fill-amber-400 stroke-amber-400"
                    : "size-3.5 fill-transparent stroke-border-strong"
                }
                strokeWidth={0.5}
              />
            );
          })}
        </div>
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
          {review.stars}.0
        </span>
      </div>

      {/* Comment */}
      {review.comment && (
        <div className="mt-2">
          <span
            className="block font-serif text-4xl leading-none text-amber-100 dark:text-amber-900/50 select-none"
            aria-hidden="true"
          >
            &ldquo;
          </span>
          <p className="line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
            {review.comment}
          </p>
        </div>
      )}
    </div>
  );
}
