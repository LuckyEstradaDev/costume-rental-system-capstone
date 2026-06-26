"use client";

import Image from "next/image";
import {
  StarIcon,
  Receipt,
  Package,
  Tag,
  CreditCard,
  Clock,
  PencilIcon,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
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
          {/* Primary details row */}
          <div className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2 md:grid-cols-3">
            <DetailText
              label="Type"
              value={item.type === "rent" ? "Rental" : "Purchase"}
            />
            <DetailTextBadge
              label="Status"
              value={item.status ? formatStatusLabel(item.status) : "N/A"}
            />
            <DetailText label="Payment Method" value={item.payment.method!} />

            <DetailTextBadge
              label="Payment Status"
              value={formatStatusLabel(item.payment?.status)}
            />

            <DetailText
              label={item.type === "rent" ? "Placed Rent" : "Placed Order"}
              value={formatReadableDateTime(item.createdAt)}
            />
            {item.type === "rent" && (
              <>
                <DetailText
                  label="Rental Duration"
                  value={
                    item.rentalDays ? `${item.rentalDays} day(s)` : "Not set"
                  }
                />
                <DetailText
                  label="Pickup Time"
                  value={
                    item.pickupTime
                      ? formatReadableDateTime(item.pickupTime)
                      : "Not picked up yet"
                  }
                />
                <DetailText
                  label="Due Date"
                  value={
                    item.duedate
                      ? formatReadableDateTime(item.duedate)
                      : "Not available yet"
                  }
                />

                <DetailText
                  label="Return Time"
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
            const itemTotal = Number(orderItem.price) * orderItem.quantity;
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
                    {formatCurrency(Number(orderItem.price))}
                  </p>

                  {/* Review preview */}
                  {review && <ReviewPreview review={review} />}

                  {/* Action row */}
                  {canLeaveReview && (
                    <div className="mt-1 flex justify-end">
                      <ReviewModal
                        outfitID={orderItem.outfitId}
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

type DetailTextProps = {
  label: string;
  value: string;
  mono?: boolean;
};

function DetailText({label, value, mono}: DetailTextProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
        {label}
      </p>
      <p
        className={`text-sm font-medium text-foreground ${
          mono ? "font-mono text-xs tracking-tight" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

type DetailTextBadgeProps = {
  label: string;
  value: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
};

function DetailTextBadge({
  label,
  value,
  variant = "secondary",
}: DetailTextBadgeProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
        {label}
      </p>
      <Badge variant={variant} className="w-fit text-xs">
        {value}
      </Badge>
    </div>
  );
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
