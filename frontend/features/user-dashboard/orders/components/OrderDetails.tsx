import Image from "next/image";
import {Card} from "@/components/ui/card";
import {OrderTrackingItem} from "../types/IOrderTracking";

type OrderDetailsProps = {
  item: OrderTrackingItem;
};

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const dateTimeFormatter = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeStyle: "short",
});

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
});

const formatDateTime = (value?: string) => {
  if (!value) {
    return "";
  }

  return dateTimeFormatter.format(new Date(value));
};

const formatDate = (value?: string) => {
  if (!value) {
    return "";
  }

  return dateFormatter.format(new Date(value));
};

export function OrderDetails({item}: OrderDetailsProps) {
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <h3 className="font-semibold">Transaction details</h3>
        <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
          <DetailText label="Reference" value={item._id} />
          <DetailText label="Created" value={formatDateTime(item.createdAt)} />
          <DetailText label="Payment method" value={item.paymentMethod} />
          <DetailText label="Payment status" value={item.paymentStatus} />
          <DetailText
            label="Transaction ID"
            value={item.transactionId || "None"}
          />
          {item.type === "rent" && (
            <>
              <DetailText
                label="Rent start"
                value={formatDate(item.rentStart) || "Not set"}
              />
              <DetailText
                label="Rent end"
                value={formatDate(item.rentEnd) || "Not set"}
              />
              <DetailText
                label="Pickup time"
                value={formatDateTime(item.pickupTime) || "Not picked up yet"}
              />
              <DetailText
                label="Return time"
                value={formatDateTime(item.returnTime) || "Not returned yet"}
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
                      src={
                        orderItem.imageURL ||
                        "/assets/images/landing-page/suit.jpg"
                      }
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
