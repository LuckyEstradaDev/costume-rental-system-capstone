import Image from "next/image";
import Link from "next/link";
import {CalendarClock, Package, ShoppingBag} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {
  formatCurrency,
  formatReadableDateTime,
  formatStatusLabel,
} from "@/lib/formatters";
import {OrderStatusBadge} from "./OrderStatusBadge";
import {getSafeOrderImageSrc} from "../utils/image";
import {IRent} from "../../rent/types/IRent";
import {IOrder} from "../../buy/types/IOrder";

export function OrderTrackingCard({item}: {item: IOrder | IRent}) {
  const firstItem = item.items[0];
  const itemCount = item.items.reduce((sum, orderItem) => {
    return sum + orderItem.quantity;
  }, 0);

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image
              src={getSafeOrderImageSrc(firstItem?.imageURL)}
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
              <p className="font-semibold">{item.referenceID || item._id}</p>
              <OrderStatusBadge status={item.status} />
            </div>

            <p className="mt-1 font-medium">{firstItem?.name}</p>
            <p className="text-sm text-muted-foreground">
              {itemCount} item{itemCount === 1 ? "" : "s"} -{" "}
              {item.payment.status}
            </p>
          </div>
        </div>

        <div className="flex min-w-40 flex-col items-end justify-between gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
            {item.type === "rent" ? (
              <CalendarClock className="size-4" />
            ) : (
              <ShoppingBag className="size-4" />
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-lg font-bold">
              {formatCurrency(item.totalAmount)}
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="grid gap-3 text-sm md:grid-cols-3">
        {item.type === "rent" ? (
          <>
            <InfoItem label="Type" value={formatStatusLabel(item.type)} />
            <InfoItem
              label="Payment method"
              value={formatStatusLabel(item.payment!.method!)}
            />

            <InfoItem
              label="Placed rent"
              value={formatReadableDateTime(item.createdAt)}
            />
          </>
        ) : (
          <>
            <InfoItem label="Type" value={formatStatusLabel(item.type)} />

            <InfoItem
              label="Payment Method"
              value={formatStatusLabel(item.payment!.method!)}
            />

            <InfoItem
              label="Placed order"
              value={formatReadableDateTime(item.createdAt)}
            />
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
