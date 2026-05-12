import Image from "next/image";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {formatCurrency, formatReadableDateTime} from "@/lib/formatters";
import {OrderTrackingItem} from "../types/IOrderTracking";
import {getSafeOrderImageSrc} from "../utils/image";

type OrderDetailsProps = {
  item: OrderTrackingItem;
};

export function OrderDetails({item}: OrderDetailsProps) {
  const canLeaveReview =
    item.type === "rent" &&
    (item.status === "returned" || Boolean(item.returnTime));

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <h3 className="font-semibold">Transaction details</h3>
        <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
          <DetailText label="Reference" value={item._id} />
          <DetailText label="Payment method" value={item.paymentMethod} />
          <DetailText label="Payment status" value={item.paymentStatus} />
          <DetailText
            label="Transaction ID"
            value={item.transactionId || "None"}
          />
          {item.type === "rent" && (
            <>
              <DetailText
                label="Rental days"
                value={
                  item.rentalDays ? `${item.rentalDays} day(s)` : "Not set"
                }
              />
              <DetailText
                label="Due date"
                value={
                  item.duedate
                    ? formatReadableDateTime(item.duedate)
                    : "Not available yet"
                }
              />
              <DetailText
                label="Pickup time"
                value={
                  item.pickupTime
                    ? formatReadableDateTime(item.pickupTime)
                    : "Not picked up yet"
                }
              />
              <DetailText
                label="Return time"
                value={
                  item.returnTime
                    ? formatReadableDateTime(item.returnTime)
                    : "Not returned yet"
                }
              />
              <DetailText
                label="Rental status"
                value={item.pickupTime ? "Picked up" : "Starts on pickup"}
              />
            </>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold">Items</h3>
        <div className="mt-3 space-y-3">
          {item.items.map((orderItem, index) => {
            const itemTotal = Number(orderItem.price) * orderItem.quantity;

            return (
              <div
                key={index}
                className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={getSafeOrderImageSrc(orderItem.imageURL)}
                      alt={orderItem.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{orderItem.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {orderItem.category} - Size {orderItem.size} -{" "}
                      {orderItem.color}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Qty {orderItem.quantity} x{" "}
                      {formatCurrency(Number(orderItem.price))}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-muted-foreground">Item total</p>
                  <p className="font-semibold">{formatCurrency(itemTotal)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {canLeaveReview && (
        <Card className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">Leave a review</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your service is complete. Share your feedback about the rental.
              </p>
            </div>

            <Button type="button" variant="outline">
              Give a review
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

type DetailTextProps = {
  label: string;
  value: string;
};

function DetailText({label, value}: DetailTextProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
