import Image from "next/image";
import Link from "next/link";
import {CalendarClock, ShoppingBag} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  formatCurrency,
  formatReadableDateTime,
  formatStatusLabel,
} from "@/lib/formatters";
import {OrderStatusBadge} from "./OrderStatusBadge";
import {buildOrderSlug} from "@/lib/slug";
import {getSafeOrderImageSrc} from "../utils/image";
import {IRent} from "../../rent/types/IRent";
import {IOrder} from "../../buy/types/IOrder";

export function OrderTrackingCard({item}: {item: IOrder | IRent}) {
  const firstItem = item.items[0];
  const itemCount = item.items.reduce((sum, orderItem) => {
    return sum + orderItem.quantity;
  }, 0);
  const isRent = item.type === "rent";
  const detailsHref = `/dashboard/orders/${buildOrderSlug(
    item.referenceID || firstItem?.name || "order",
    item._id,
  )}`;

  return (
    <div className="group flex items-center gap-4 rounded-lg border border-border bg-background p-4 transition-colors hover:border-border/80 hover:bg-muted/40">
      <Link
        href={detailsHref}
        className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/50"
      >
        <Image
          src={getSafeOrderImageSrc(firstItem?.imageURL)}
          alt={firstItem?.name || "Costume"}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {item.isPackage && (
          <div className="absolute left-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
            Package
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold">
            {item.referenceID || item._id}
          </p>
          <OrderStatusBadge status={item.status} />
        </div>

        <h3 className="mt-0.5 truncate font-medium">
          <Link
            href={detailsHref}
            className="transition-colors hover:text-primary hover:underline"
          >
            {firstItem?.name}
          </Link>
        </h3>

        <p className="mt-0.5 text-sm text-muted-foreground">
          {itemCount} item{itemCount === 1 ? "" : "s"} ·{" "}
          {formatStatusLabel(item.type)}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatStatusLabel(item.payment?.method)} ·{" "}
          {formatReadableDateTime(item.createdAt)}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-3">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          {isRent ? (
            <CalendarClock className="size-3.5" />
          ) : (
            <ShoppingBag className="size-3.5" />
          )}
          {formatCurrency(item.totalAmount)}
        </span>

        <Button variant="outline" size="sm" asChild>
          <Link href={detailsHref}>View details</Link>
        </Button>
      </div>
    </div>
  );
}