import Image from "next/image";
import Link from "next/link";
import {CalendarClock, Package, ShoppingBag} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {OrderStatusBadge} from "./OrderStatusBadge";
import type {OrderTrackingItem} from "../types/IOrderTracking";

type OrderTrackingCardProps = {
  item: OrderTrackingItem;
};

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

export function OrderTrackingCard({item}: OrderTrackingCardProps) {
  const firstItem = item.items[0];
  const itemCount = item.items.reduce((sum, orderItem) => {
    return sum + orderItem.quantity;
  }, 0);

  console.log(item);

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image
              src={
                firstItem?.imageURL || "/assets/images/landing-page/suit.jpg"
              }
              alt={firstItem?.name || "Costume"}
              fill
              className="object-cover"
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {item.type === "rent" ? (
                <CalendarClock className="size-4 text-muted-foreground" />
              ) : (
                <ShoppingBag className="size-4 text-muted-foreground" />
              )}
              <p className="font-semibold">{item._id}</p>
              <OrderStatusBadge status={item.status} />
            </div>

            <p className="mt-1 font-medium">{firstItem?.name}</p>
            <p className="text-sm text-muted-foreground">
              {itemCount} item{itemCount === 1 ? "" : "s"} -{" "}
              {item.paymentStatus}
            </p>
          </div>
        </div>

        <div className="text-left lg:text-right">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-lg font-bold">
            {formatCurrency(item.totalAmount)}
          </p>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="grid gap-3 text-sm md:grid-cols-3">
        <InfoItem label="Created" value={item.createdAt} />
        {item.type === "rent" ? (
          <>
            <InfoItem label="Rent start" value={item.rentStart || "Not set"} />
            <InfoItem label="Rent end" value={item.rentEnd || "Not set"} />
          </>
        ) : (
          <>
            <InfoItem label="Type" value="Purchase" />
            <InfoItem label="Tracking" value="Preparing order" />
          </>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/orders/${item._id}`}>View details</Link>
        </Button>
      </div>
    </Card>
  );
}

type InfoItemProps = {
  label: string;
  value: string;
};

function InfoItem({label, value}: InfoItemProps) {
  return (
    <div className="flex items-center gap-2">
      <Package className="size-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
