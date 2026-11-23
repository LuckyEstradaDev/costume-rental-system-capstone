"use client";

import {Card} from "@/components/ui/card";
import Image from "next/image";
import {
  calculateReservationAmount,
  formatCurrency,
  getRemainingBalance,
} from "@/lib/formatters";
import {getPackageImageSrc} from "@/lib/package-identity";
import {METHOD_LABELS, type OnlinePaymentMethod} from "../../payment/types/IPaymongo";
import type {IPackageCartItem} from "../../package/types/IPackageCartItem";
import type {Snapshot} from "../types/ISnapshot";
import type {CheckoutMode, ReservationPaymentMethod} from "../types/checkout";
import {getSafeOrderImageSrc} from "../../orders/utils/image";
import {OrderDetailField} from "@/features/reusable/OrderDetailPanel";

type CheckoutItem = Snapshot | IPackageCartItem;

type CheckoutSummaryProps = {
  items: CheckoutItem[];
  checkoutMode: CheckoutMode;
  reserveOutfit: boolean;
  reservationPaymentMethod: ReservationPaymentMethod;
  finalPaymentMethod: OnlinePaymentMethod | "cash";
  subtotal: number;
  total: number;
};

export function CheckoutSummary({
  items,
  checkoutMode,
  reserveOutfit,
  reservationPaymentMethod,
  finalPaymentMethod,
  subtotal,
  total,
}: CheckoutSummaryProps) {
  const isRent = checkoutMode === "rent";
  const isReservation = reserveOutfit;
  const isCashReservation = isReservation && reservationPaymentMethod === "cash";
  const reservationAmount = isReservation
    ? calculateReservationAmount(total)
    : 0;
  const remainingBalance = isReservation
    ? getRemainingBalance(total, reservationAmount)
    : total;

  const packages = items.filter(isPackage);
  const singleItems = items.filter(isSnapshot);

  return (
    <Card className="h-fit min-w-0 gap-0 rounded-lg border border-border/50 bg-background p-5 ring-0 md:p-6">
      <h2 className="mb-4 text-xl font-semibold text-primary md:text-2xl">
        Checkout summary
      </h2>
      <div className="overflow-x-auto" role="region" aria-label="Checkout items" tabIndex={0}>
        <table className="w-full whitespace-nowrap text-left">
          <thead className="text-sm text-secondary/70">
            <tr>
              <th scope="col" className="py-2 pr-4 font-medium">Item</th>
              <th scope="col" className="px-4 py-2 text-right font-medium">Qty × price</th>
              <th scope="col" className="py-2 pl-4 text-right font-medium">Total</th>
            </tr>
          </thead>
          {singleItems.length > 0 && (
            <tbody>
              {singleItems.map((item, index) => (
                <CheckoutItemRow key={index} item={item} unitPrice={Number(item.price) || 0} />
              ))}
            </tbody>
          )}
          {packages.map((pkg) => (
            <tbody key={pkg.packageId}>
              <tr>
                <th scope="rowgroup" colSpan={3} className="py-2 text-sm font-semibold text-primary">
                  <span className="flex items-center gap-3">
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/50">
                      <Image src={getPackageImageSrc(pkg.imageURL)} alt="" fill sizes="48px" className="object-cover" />
                    </span>
                    {pkg.name}
                  </span>
                </th>
              </tr>
              {pkg.items.map((item, index) => (
                <CheckoutItemRow
                  key={index}
                  item={item}
                  unitPrice={Number(isRent ? item.rentalPrice : item.price) || 0}
                />
              ))}
            </tbody>
          ))}
        </table>
      </div>
      <dl className="mt-4 space-y-2 border-t border-border/50 pt-4 text-sm text-secondary">
        {subtotal !== total && (
          <div className="flex items-center justify-between gap-4">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatCurrency(subtotal)}</dd>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <dt>Order total</dt>
          <dd className="font-semibold tabular-nums">{formatCurrency(total)}</dd>
        </div>
        {isReservation && (
          <>
            <div className="flex items-center justify-between gap-4">
              <dt>{isCashReservation ? "Reservation fee (50%)" : "Due now (50%)"}</dt>
              <dd className="tabular-nums">{formatCurrency(reservationAmount)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 font-semibold text-primary">
              <dt>Remaining balance</dt>
              <dd className="tabular-nums">{formatCurrency(remainingBalance)}</dd>
            </div>
          </>
        )}
      </dl>
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-semibold text-primary">Payment details</h3>
        <dl className="grid gap-x-8 gap-y-4 md:grid-cols-2">
          {isReservation && (
            <OrderDetailField
              label="Reservation method"
              value={reservationPaymentMethod === "cash" ? "Cash on hand" : METHOD_LABELS[reservationPaymentMethod]}
              className="[&>dt]:text-base"
            />
          )}
          <OrderDetailField
            label={isReservation ? "Final payment method" : "Payment method"}
            value={finalPaymentMethod === "cash" ? "Cash on hand" : METHOD_LABELS[finalPaymentMethod]}
            className="[&>dt]:text-base"
          />
        </dl>
        {isCashReservation && (
          <p className="text-base leading-relaxed text-secondary">
            Pay the reservation fee in cash within 24 hours. The remaining cash balance is due at pickup.
          </p>
        )}
      </div>
    </Card>
  );
}

function CheckoutItemRow({item, unitPrice}: {item: Snapshot; unitPrice: number}) {
  const quantity = item.quantity || 1;
  return (
    <tr>
      <td className="py-2 pr-4">
        <div className="flex items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/50">
            <Image src={getSafeOrderImageSrc(item.imageURL)} alt={item.name || "Outfit"} fill sizes="48px" className="object-cover" />
          </div>
          <span className="text-base font-medium text-foreground">{item.name}</span>
          <span className="text-sm text-secondary/70">
            {[item.size || "One Size", item.color].filter(Boolean).join(" · ")}
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
  );
}

const isSnapshot = (item: CheckoutItem): item is Snapshot => "outfitId" in item;

const isPackage = (item: CheckoutItem): item is IPackageCartItem =>
  "packageId" in item;
