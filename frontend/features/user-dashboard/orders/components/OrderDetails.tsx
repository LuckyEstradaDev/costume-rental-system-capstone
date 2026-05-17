"use client";

import Image from "next/image";
import {StarIcon, Receipt, Package, Tag, CreditCard, Clock} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {formatCurrency, formatReadableDateTime} from "@/lib/formatters";
import {OrderTrackingItem} from "../types/IOrderTracking";
import {getSafeOrderImageSrc} from "../utils/image";
import {ReviewModal} from "../../review/components/ReviewModal";
import {IReview} from "../../review/types/IReview";

type OrderDetailsProps = {
  item: OrderTrackingItem;
  reviews?: IReview[];
  onReviewSaved?: () => void;
};

export function OrderDetails({
  item,
  reviews = [],
  onReviewSaved,
}: OrderDetailsProps) {
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
            <DetailText label="Reference No." value={item._id} mono />
            <DetailText label="Payment Method" value={item.paymentMethod} />
            <DetailTextBadge
              label="Payment Status"
              value={item.paymentStatus}
            />
            <DetailText
              label="Transaction ID"
              value={item.transactionId || "—"}
              mono={!!item.transactionId}
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
                  label="Due Date"
                  value={
                    item.duedate
                      ? formatReadableDateTime(item.duedate)
                      : "Not available yet"
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
                  label="Return Time"
                  value={
                    item.returnTime
                      ? formatReadableDateTime(item.returnTime)
                      : "Not returned yet"
                  }
                />
                <DetailTextBadge
                  label="Rental Status"
                  value={item.pickupTime ? "Picked Up" : "Starts on Pickup"}
                  variant={item.pickupTime ? "default" : "secondary"}
                />
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Items Card */}
      <Card className="overflow-hidden border-0 bg-card shadow-sm ring-1 ring-border/60">
        {/* Card Header */}
        <div className="flex items-center gap-3 border-b border-border/50 bg-muted/30 px-5 py-3.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
            <Package className="size-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Order Items
          </h3>
          <span className="ml-auto text-xs text-muted-foreground">
            {item.items.length} {item.items.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="divide-y divide-border/50">
          {item.items.map((orderItem, index) => {
            const itemTotal = Number(orderItem.price) * orderItem.quantity;
            const review = reviews.find(
              (userReview) => userReview.outfitID === orderItem.outfitId,
            );

            return (
              <div
                key={index}
                className="group p-4 transition-colors hover:bg-muted/20 sm:p-5"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/40 sm:size-24">
                    <Image
                      src={getSafeOrderImageSrc(orderItem.imageURL)}
                      alt={orderItem.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold leading-snug text-foreground">
                          {orderItem.name}
                        </p>
                        {/* Attribute pills */}
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          <AttributePill label={orderItem.category} />
                          <AttributePill label={`Size ${orderItem.size}`} />
                          <AttributePill label={orderItem.color} />
                        </div>
                      </div>

                      {/* Item total — desktop */}
                      <div className="hidden shrink-0 text-right sm:block">
                        <p className="text-xs text-muted-foreground">
                          Item total
                        </p>
                        <p className="mt-0.5 text-base font-bold tabular-nums text-foreground">
                          {formatCurrency(itemTotal)}
                        </p>
                      </div>
                    </div>

                    {/* Quantity & price */}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {orderItem.quantity} ×{" "}
                      {formatCurrency(Number(orderItem.price))}
                    </p>

                    {/* Review preview */}
                    {review && <ReviewPreview review={review} />}

                    {/* Actions row */}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      {/* Item total — mobile */}
                      <div className="sm:hidden">
                        <p className="text-xs text-muted-foreground">
                          Item total
                        </p>
                        <p className="text-sm font-bold tabular-nums text-foreground">
                          {formatCurrency(itemTotal)}
                        </p>
                      </div>

                      {canLeaveReview && (
                        <ReviewModal
                          outfitID={orderItem.outfitId}
                          review={review}
                          onReviewSaved={onReviewSaved}
                          trigger={
                            <Button
                              type="button"
                              variant={review ? "outline" : "secondary"}
                              size="sm"
                              className="ml-auto h-8 gap-1.5 text-xs font-medium"
                            >
                              <StarIcon className="size-3" />
                              {review ? "Edit Review" : "Leave a Review"}
                            </Button>
                          }
                        />
                      )}
                    </div>
                  </div>
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
      <Badge variant={variant} className="w-fit text-xs capitalize">
        {value}
      </Badge>
    </div>
  );
}

function AttributePill({label}: {label: string}) {
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/50">
      {label}
    </span>
  );
}

function ReviewPreview({review}: {review: IReview}) {
  return (
    <div className="mt-2.5 w-full max-w-sm rounded-lg border border-amber-200/60 bg-amber-50/50 p-3 dark:border-amber-900/30 dark:bg-amber-950/20">
      {/* Stars */}
      <div
        className="flex items-center gap-0.5"
        aria-label={`${review.stars} out of 5 stars`}
      >
        {Array.from({length: 5}).map((_, index) => {
          const isFilled = index < review.stars;
          return (
            <StarIcon
              key={index}
              className={
                isFilled
                  ? "size-3.5 fill-amber-400 text-amber-400"
                  : "size-3.5 fill-transparent text-amber-200 dark:text-amber-800"
              }
            />
          );
        })}
        <span className="ml-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
          {review.stars}/5
        </span>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
          {review.comment}
        </p>
      )}
    </div>
  );
}
