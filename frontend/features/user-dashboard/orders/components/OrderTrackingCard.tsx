import Image from "next/image";
import Link from "next/link";
import {useMemo} from "react";
import {CalendarClock, ShoppingBag} from "lucide-react";
import {formatCurrency} from "@/lib/formatters";
import {OrderStatusBadge} from "./OrderStatusBadge";
import {buildOrderPath} from "@/lib/reference-path";
import {
  getOrderDisplayIdentity,
  resolveOrderPackages,
  type PackageSource,
} from "@/lib/package-identity";
import {getSafeOrderImageSrc} from "../utils/image";
import {IRent} from "../../rent/types/IRent";
import {IOrder} from "../../buy/types/IOrder";

export function OrderTrackingCard({
  item,
  packages,
}: {
  item: IOrder | IRent;
  packages: PackageSource[];
}) {
  const resolved = useMemo(
    () => resolveOrderPackages(item, packages),
    [item, packages],
  );
  const identity = getOrderDisplayIdentity(item, resolved);
  const itemCount = item.items.reduce((sum, orderItem) => {
    return sum + orderItem.quantity;
  }, 0);
  const isRent = item.type === "rent";
  const detailsHref = buildOrderPath(item.referenceID);
  const cardClass = "group grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-background p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]";

  const content = (
    <>
      <div className="relative row-span-2 size-20 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/50 sm:row-span-1 sm:size-24">
        <Image
          src={getSafeOrderImageSrc(identity.imageURL)}
          alt={identity.name || "Costume"}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {identity.isPackage && (
          <div className="absolute left-1.5 top-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
            Package
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold">
            {item.referenceID || item._id}
          </p>
          <OrderStatusBadge status={item.status} type={item.type} />
        </div>

        <h3 className="mt-0.5 truncate font-medium">
          {identity.name}
          {identity.packageCount > 1 && (
            <span className="text-muted-foreground">
              {" "}
              +{identity.packageCount - 1} more
            </span>
          )}
        </h3>

        <p className="mt-0.5 text-sm text-muted-foreground">
          {itemCount} item{itemCount === 1 ? "" : "s"}
        </p>
      </div>

      <span className="col-start-2 inline-flex items-center gap-1.5 font-semibold text-primary tabular-nums sm:col-start-3 sm:row-start-1 sm:justify-self-end">
        {isRent ? (
          <CalendarClock aria-hidden="true" className="size-3.5 shrink-0" />
        ) : (
          <ShoppingBag aria-hidden="true" className="size-3.5 shrink-0" />
        )}
        {formatCurrency(item.totalAmount)}
      </span>
    </>
  );

  return detailsHref ? (
    <Link
      href={detailsHref}
      className={cardClass + " transition-colors hover:border-secondary/50 hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"}
    >
      {content}
    </Link>
  ) : (
    <div className={cardClass}>{content}</div>
  );
}
