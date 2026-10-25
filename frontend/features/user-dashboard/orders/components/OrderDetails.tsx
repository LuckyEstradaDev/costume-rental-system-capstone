"use client";

import Image from "next/image";
import Link from "next/link";
import {type ReactNode, useMemo} from "react";
import {
  ShoppingBag,
  CalendarClock,
  CalendarDays,
  Clock,
  CreditCard,
  Hourglass,
  Pencil,
  Undo2,
  Wallet,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {StatusBadge} from "@/components/ui/status-badge";
import {getColorValue} from "@/features/admin-dashboard/inventory-tab/constants/constants";
import {formatCurrency, formatReadableDate, formatReadableDateTime, formatStatusLabel} from "@/lib/formatters";
import {buildOutfitSlug} from "@/lib/slug";
import {getSafeOrderImageSrc} from "../utils/image";
import {
  countItems,
  groupItemsByPackage,
  resolveOrderPackages,
  type PackageItemGroup,
  type PackageSource,
} from "@/lib/package-identity";
import type {Snapshot} from "../../cart/types/ISnapshot";
import {ReviewModal} from "../../review/components/ReviewModal";
import {StarRating} from "../../review/components/StarRating";
import {IReview} from "../../review/types/IReview";
import {IOrder} from "../../buy/types/IOrder";
import {IRent} from "../../rent/types/IRent";

const getOrderItemUnitPrice = (order: IRent | IOrder, orderItem: Snapshot) =>
  Number(order.type === "rent" ? (orderItem.rentalPrice ?? orderItem.price) : orderItem.price);

const getOrderItemTotal = (order: IRent | IOrder, orderItem: Snapshot) =>
  getOrderItemUnitPrice(order, orderItem) * orderItem.quantity;

export function OrderDetails({
  item,
  packages,
  reviews = [],
  onReviewSaved,
}: {
  item: IRent | IOrder;
  packages: PackageSource[];
  reviews?: IReview[];
  onReviewSaved?: () => void;
}) {
  const canLeaveReview = item.status === "returned" || item.status === "received";
  const resolved = useMemo(() => resolveOrderPackages(item, packages), [item, packages]);
  const packageGroups = groupItemsByPackage(item.items, resolved);

  return (
    <div className="space-y-4 font-[family-name:var(--font-geist-sans)]">
      {/* Transaction Details Card */}
      <Card className="h-fit gap-0 rounded-lg border border-border bg-card p-5">
        <h2 className="pb-4 text-lg font-semibold tracking-tight text-primary">Transaction Details</h2>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <QuickFact
            icon={item.type === "rent" ? CalendarClock : ShoppingBag}
            label="Type"
            value={item.type === "rent" ? "Rental" : "Purchase"}
          />
          <QuickFact icon={CreditCard} label="Payment method" value={formatStatusLabel(item.payment?.method)} />
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
                label="Event date"
                value={item.eventDate ? formatReadableDate(item.eventDate) : "Not set"}
              />
              <QuickFact
                icon={Undo2}
                label="Pickup time"
                value={item.pickupTime ? formatReadableDateTime(item.pickupTime) : "Not picked up yet"}
              />
              <QuickFact
                icon={Hourglass}
                label="Due date"
                value={item.duedate ? formatReadableDateTime(item.duedate) : "Not available yet"}
              />
              <QuickFact
                icon={CalendarClock}
                label="Return time"
                value={item.returnTime ? formatReadableDateTime(item.returnTime) : "Not returned yet"}
              />
            </>
          )}
        </div>
      </Card>

      {/* Items Card */}
      <Card className="h-fit gap-0 rounded-lg border border-border bg-card p-5">
        <h2 className="pb-4 text-lg font-semibold tracking-tight text-primary">Items</h2>

        {!packageGroups && <div className="mb-4 h-0.5 rounded-full bg-border" />}

        <div className="space-y-2">
          {!packageGroups && <ReceiptColumnLabels />}

          <ul className={packageGroups ? "space-y-5" : "space-y-3 pt-2"}>
            {packageGroups
              ? packageGroups.map((group, index) => (
                  <PackageReceiptBlock
                    key={`${group.identity.packageId}-${index}`}
                    group={group}
                    order={item}
                    reviews={reviews}
                    canLeaveReview={canLeaveReview}
                    onReviewSaved={onReviewSaved}
                  />
                ))
              : item.items.map((orderItem, index) => (
                  <ReceiptItemRow
                    key={`${orderItem.outfitId}-${orderItem.size}-${index}`}
                    orderItem={orderItem}
                    order={item}
                    reviews={reviews}
                    canLeaveReview={canLeaveReview}
                    onReviewSaved={onReviewSaved}
                  />
                ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReceiptColumnLabels() {
  return (
    <div className="flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
      <span>Item</span>
      <div className="flex shrink-0 items-center gap-4">
        <span className="w-8 text-right">Qty</span>
        <span className="w-24 text-right">Price</span>
      </div>
    </div>
  );
}

type ReceiptItemRowProps = {
  orderItem: Snapshot;
  order: IRent | IOrder;
  href?: string;
  reviews: IReview[];
  canLeaveReview: boolean;
  onReviewSaved?: () => void;
};

function ReceiptItemRow({orderItem, order, href, reviews, canLeaveReview, onReviewSaved}: ReceiptItemRowProps) {
  const itemTotal = getOrderItemTotal(order, orderItem);
  const review = reviews.find((r) => r.outfitID === orderItem.outfitId);
  const thumbnail = (
    <Image
      src={getSafeOrderImageSrc(orderItem.imageURL)}
      alt={orderItem.name || "Costume"}
      fill
      className="object-cover transition-transform duration-300 group-hover:scale-105"
    />
  );

  return (
    <li>
      <div className="group flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {href ? (
            <Link
              href={href}
              title={`View ${orderItem.name}`}
              className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/50"
            >
              {thumbnail}
            </Link>
          ) : (
            <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/50">
              {thumbnail}
            </div>
          )}

          <div className="min-w-0">
            {href ? (
              <Link
                href={href}
                className="block truncate text-base font-medium text-foreground transition-colors hover:text-primary hover:underline"
              >
                {orderItem.name}
              </Link>
            ) : (
              <p className="truncate text-base font-medium text-foreground">{orderItem.name}</p>
            )}
            <p className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{orderItem.size || "One Size"}</span>
              <span
                className="size-3 shrink-0 rounded-full border border-foreground/30"
                style={{
                  backgroundColor: getColorValue(orderItem.color),
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
                }}
                title={orderItem.color}
                aria-label={`Color ${orderItem.color}`}
              />
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <span className="w-8 text-right text-base tabular-nums text-muted-foreground">{orderItem.quantity || 1}</span>
          <span className="w-24 text-right text-base font-medium tabular-nums text-foreground">
            {formatCurrency(itemTotal)}
          </span>
        </div>
      </div>

      <OrderReview
        orderItem={orderItem}
        order={order}
        review={review}
        canLeaveReview={canLeaveReview}
        onReviewSaved={onReviewSaved}
      />
    </li>
  );
}

type PackageReceiptBlockProps = {
  group: PackageItemGroup<Snapshot>;
  order: IRent | IOrder;
  reviews: IReview[];
  canLeaveReview: boolean;
  onReviewSaved?: () => void;
};

function PackageReceiptBlock({group, order, reviews, canLeaveReview, onReviewSaved}: PackageReceiptBlockProps) {
  const pieceCount = countItems(group.items);

  return (
    <li className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/50">
          <Image
            src={getSafeOrderImageSrc(group.identity.imageURL?.[0])}
            alt={group.identity.name || "Package"}
            fill
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium text-foreground">{group.identity.name}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {pieceCount} {pieceCount === 1 ? "piece" : "pieces"}
          </p>
        </div>
      </div>

      <ReceiptColumnLabels />

      {group.items.length > 0 ? (
        <ul className="space-y-3 pt-1">
          {group.items.map((orderItem, index) => (
            <ReceiptItemRow
              key={`${orderItem.outfitId}-${orderItem.size}-${index}`}
              orderItem={orderItem}
              order={order}
              href={`/dashboard/browse/${buildOutfitSlug(orderItem.name, orderItem.outfitId)}`}
              reviews={reviews}
              canLeaveReview={canLeaveReview}
              onReviewSaved={onReviewSaved}
            />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No costumes in this package.</p>
      )}
    </li>
  );
}

type OrderReviewProps = {
  orderItem: Snapshot;
  order: IRent | IOrder;
  review?: IReview;
  canLeaveReview: boolean;
  onReviewSaved?: () => void;
};

function OrderReview({orderItem, order, review, canLeaveReview, onReviewSaved}: OrderReviewProps) {
  if (!review && !canLeaveReview) {
    return null;
  }

  const reviewAction = canLeaveReview ? (
    <ReviewModal
      outfitID={orderItem.outfitId}
      orderID={order._id!}
      review={review}
      onReviewSaved={onReviewSaved}
      trigger={
        review ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            aria-label="Edit review"
            title="Edit review"
          >
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button type="button" size="sm" className="w-32">
            Leave a review
          </Button>
        )
      }
    />
  ) : null;

  if (review) {
    return (
      <div className="mt-3">
        <ReviewPreview review={review} action={reviewAction} />
      </div>
    );
  }

  return <div className="mt-3 flex justify-end">{reviewAction}</div>;
}

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
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium leading-snug text-foreground">{value}</p>
      </div>
    </div>
  );
}

function PaymentStatusBadge({status}: {status?: string}) {
  return <StatusBadge status={status} />;
}

function ReviewPreview({review, action}: {review: IReview; action?: ReactNode}) {
  return (
    <div className="w-full rounded-lg border border-border/60 bg-muted/25 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StarRating value={review.stars} />
          <span className="text-xs font-medium tabular-nums text-muted-foreground">{review.stars}/5</span>
        </div>

        {review.createdAt && (
          <span className="text-xs text-muted-foreground">{formatReadableDate(review.createdAt)}</span>
        )}
      </div>

      <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-foreground/80">
        {review.comment || <span className="italic text-muted-foreground">No written comment.</span>}
      </p>

      {action && <div className="mt-2.5 flex justify-end">{action}</div>}
    </div>
  );
}
