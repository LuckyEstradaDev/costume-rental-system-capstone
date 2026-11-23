"use client";

import Image from "next/image";
import Link from "next/link";
import {type ReactNode, useMemo} from "react";
import {Pencil} from "lucide-react";
import {Button} from "@/components/ui/button";
import {StatusBadge} from "@/components/ui/status-badge";
import {
  calculateReservationAmount,
  formatCurrency,
  formatReadableDate,
  formatReadableDateTime,
  formatStatusLabel,
  getRemainingBalance,
} from "@/lib/formatters";
import {buildOutfitPath} from "@/lib/reference-path";
import {getSafeOrderImageSrc} from "../utils/image";
import {
  groupItemsByPackage,
  resolveOrderPackages,
  type PackageSource,
} from "@/lib/package-identity";
import type {Snapshot} from "../../cart/types/ISnapshot";
import {ReviewModal} from "../../review/components/ReviewModal";
import {StarRating} from "../../review/components/StarRating";
import {IReview} from "../../review/types/IReview";
import {IOrder} from "../../buy/types/IOrder";
import {OrderProgress} from "@/features/reusable/OrderProgress";
import {OrderDetailField, OrderDetailPanel} from "@/features/reusable/OrderDetailPanel";
import {OrderCancellationAndRefund} from "@/features/reusable/OrderCancellationAndRefund";
import {IRent} from "../../rent/types/IRent";

const getOrderItemUnitPrice = (order: IRent | IOrder, orderItem: Snapshot) =>
  Number(order.type === "rent" ? (orderItem.rentalPrice ?? orderItem.price) : orderItem.price);

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
  const paymentStatus = item.payment?.status || (item.payment?.paidAt ? "paid" : "pending");
  const isPaymentPaid = paymentStatus === "paid";
  const reservation = item.payment?.reservation;
  const isReservation = Boolean(reservation?.requested);
  const reservationPaid = reservation?.status === "paid";
  const isLegacyCashReservation = reservation?.method === "cash" && reservation.status === "approved";
  const reservationAmount = Number(
    reservation?.amount ?? calculateReservationAmount(item.totalAmount),
  );
  const remainingBalance = getRemainingBalance(
    item.totalAmount,
    reservationAmount,
  );
  const recordedReservationPayment =
    isReservation && !isLegacyCashReservation &&
    (reservationPaid || Boolean(reservation?.paidAt) ||
      reservation?.status === "forfeited" ||
      (reservation?.method !== "cash" && reservation?.status === "refunded"));
  const finalPaymentMethod = item.payment?.method;
  const paymentMethod =
    isReservation && !reservationPaid
      ? reservation?.method ?? finalPaymentMethod
      : finalPaymentMethod;

  return (
    <div className="min-w-0 space-y-8 md:space-y-12">
      <section className="min-w-0">
        <h2 className="mb-4 text-xl font-semibold text-primary md:text-2xl">Order progress</h2>
        <OrderProgress
          type={item.type}
          status={item.status}
          paymentMethod={paymentMethod}
          isPaymentPaid={isPaymentPaid}
          isPaymentRefunded={item.payment?.status === "refunded"}
          cancelledFrom={item.cancelledFrom}
          hasSecurityDeposit={item.type === "rent" ? Boolean(item.securityDeposit) : false}
          isReservationRequested={isReservation}
          isReservationConfirmed={
            reservationPaid ||
            Boolean(reservation?.paidAt) ||
            (reservation?.method === "cash" && reservation.status === "approved")
          }
          nowrap
        />
      </section>

      {item.status === "cancelled" && (
        <OrderCancellationAndRefund
          open
          cancelledAt={item.cancelledAt}
          isRefunded={item.payment?.status === "refunded"}
          refundedAt={item.payment?.refundedAt ?? item.payment?.updatedAt}
        />
      )}

      <div className="grid min-w-0 gap-8 md:gap-12 xl:grid-cols-2">
        <section className="col-span-full min-w-0">
          <h2 className="mb-4 text-xl font-semibold text-primary md:text-2xl">Order contents</h2>
          <div className="overflow-x-auto" role="region" aria-label="Order items" tabIndex={0}>
            <table className="w-full whitespace-nowrap text-left">
              <thead className="text-sm text-secondary/70">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-medium">Item</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">Qty × price</th>
                  <th scope="col" className="py-2 pl-4 text-right font-medium">Total</th>
                </tr>
              </thead>
              {packageGroups ? packageGroups.map((group, groupIndex) => (
                <tbody key={`${group.identity.packageId}-${groupIndex}`}>
                  <tr>
                    <th scope="rowgroup" colSpan={3} className="py-2 text-sm font-semibold text-primary">
                      <span className="flex items-center gap-3">
                        <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/50">
                          <Image src={getSafeOrderImageSrc(group.identity.imageURL?.[0])} alt={group.identity.name || "Package"} fill className="object-cover" />
                        </span>
                        {group.identity.name}
                      </span>
                    </th>
                  </tr>
                  {group.items.map((orderItem, index) => (
                    <ReceiptItemRow
                      key={`${orderItem.outfitId}-${orderItem.size}-${index}`}
                      orderItem={orderItem}
                      order={item}
                      href={buildOutfitPath(orderItem.outfitReferenceID) || buildOutfitPath(orderItem.outfitId) || "/dashboard/browse"}
                      reviews={reviews}
                      canLeaveReview={canLeaveReview}
                      onReviewSaved={onReviewSaved}
                    />
                  ))}
                </tbody>
              )) : (
                <tbody>
                  {item.items.map((orderItem, index) => (
                    <ReceiptItemRow
                      key={`${orderItem.outfitId}-${orderItem.size}-${index}`}
                      orderItem={orderItem}
                      order={item}
                      reviews={reviews}
                      canLeaveReview={canLeaveReview}
                      onReviewSaved={onReviewSaved}
                    />
                  ))}
                </tbody>
              )}
            </table>
          </div>
          <dl className="mt-4 space-y-2 border-t border-border/50 pt-4 text-sm text-secondary">
            <div className="flex items-center justify-between gap-4">
              <dt>Order total</dt>
              <dd className="font-semibold tabular-nums">{formatCurrency(item.totalAmount)}</dd>
            </div>
            {recordedReservationPayment && (
              <>
                <div className="flex items-center justify-between gap-4">
                  <dt>Reservation payment</dt>
                  <dd className="tabular-nums">−{formatCurrency(reservationAmount)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 font-semibold text-primary">
                  <dt>Final payment</dt>
                  <dd className="tabular-nums">{formatCurrency(remainingBalance)}</dd>
                </div>
              </>
            )}
          </dl>
        </section>

        <OrderDetailPanel open title="Transaction details" singleColumn className="col-span-full">
          <OrderDetailField label="Order placed" value={formatReadableDateTime(item.createdAt)} />
          <OrderDetailField label="Payment method" value={formatStatusLabel(finalPaymentMethod)} />
          <OrderDetailField label="Payment status" value={<PaymentStatusBadge status={paymentStatus} />} />
          {item.payment?.paidAt && (
            <OrderDetailField label="Paid at" value={formatReadableDateTime(item.payment.paidAt)} />
          )}
        </OrderDetailPanel>

        {item.type === "rent" && (
          <OrderDetailPanel open title="Rental schedule" singleColumn className={!isReservation ? "col-span-full" : undefined}>
            <OrderDetailField label="Event date" value={item.eventDate ? formatReadableDate(item.eventDate) : "Not set"} />
            <OrderDetailField label="Pickup time" value={item.pickupTime ? formatReadableDateTime(item.pickupTime) : "Not picked up yet"} />
            <OrderDetailField label="Due date" value={item.duedate ? formatReadableDateTime(item.duedate) : "Not available yet"} />
            <OrderDetailField label="Return time" value={item.returnTime ? formatReadableDateTime(item.returnTime) : "Not returned yet"} />
          </OrderDetailPanel>
        )}

        {isReservation && (
          <OrderDetailPanel open title="Reservation details" singleColumn className={item.type !== "rent" ? "col-span-full" : undefined}>
            <OrderDetailField label="Reservation method" value={formatStatusLabel(reservation?.method)} />
            <OrderDetailField label="Reservation status" value={<PaymentStatusBadge status={reservation?.status} />} />
            {!isLegacyCashReservation && !recordedReservationPayment && (
              <OrderDetailField label="Reservation fee" value={formatCurrency(reservationAmount)} />
            )}
            {reservation?.deadlineAt && (
              <OrderDetailField label="Payment deadline" value={formatReadableDateTime(reservation.deadlineAt)} />
            )}
            {reservation?.paidAt && (
              <OrderDetailField label="Paid at" value={formatReadableDateTime(reservation.paidAt)} />
            )}
          </OrderDetailPanel>
        )}
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
  const unitPrice = getOrderItemUnitPrice(order, orderItem);
  const quantity = orderItem.quantity || 1;
  const review = reviews.find((entry) => entry.outfitID === orderItem.outfitId);
  const thumbnail = (
    <Image
      src={getSafeOrderImageSrc(orderItem.imageURL)}
      alt={orderItem.name || "Costume"}
      fill
      className="object-cover transition-transform duration-300 group-hover:scale-105"
    />
  );
  const thumbnailClass = "relative size-12 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/50";

  return (
    <>
      <tr className="group">
        <td className="py-2 pr-4">
          <div className="flex items-center gap-3">
            {href ? (
              <Link href={href} title={`View ${orderItem.name}`} className={thumbnailClass}>{thumbnail}</Link>
            ) : (
              <div className={thumbnailClass}>{thumbnail}</div>
            )}
            {href ? (
              <Link href={href} className="text-base font-medium text-foreground transition-colors hover:text-primary hover:underline">
                {orderItem.name}
              </Link>
            ) : (
              <span className="text-base font-medium text-foreground">{orderItem.name}</span>
            )}
            <span className="text-sm text-secondary/70">
              {[orderItem.size || "One Size", orderItem.color].filter(Boolean).join(" · ")}
            </span>
          </div>
        </td>
        <td className="px-4 py-2 text-right text-sm tabular-nums text-secondary">
          {quantity} × {formatCurrency(unitPrice)}
        </td>
        <td className="py-2 pl-4 text-right text-base font-semibold tabular-nums text-secondary">
          {formatCurrency(unitPrice * quantity)}
        </td>
      </tr>
      {(review || canLeaveReview) && (
        <tr>
          <td colSpan={3} className="whitespace-normal">
            <OrderReview orderItem={orderItem} order={order} review={review} canLeaveReview={canLeaveReview} onReviewSaved={onReviewSaved} />
          </td>
        </tr>
      )}
    </>
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

function PaymentStatusBadge({status}: {status?: string}) {
  return <StatusBadge status={status} />;
}

function ReviewPreview({review, action}: {review: IReview; action?: ReactNode}) {
  return (
    <div className="w-full border-t border-border/50 pt-3">
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
