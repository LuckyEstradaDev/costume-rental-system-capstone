import Image from "next/image";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {CalendarClock, Receipt, ShoppingBag} from "lucide-react";
import {Card} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {
  formatCurrency,
  formatReadableDate,
  formatStatusLabel,
} from "@/lib/formatters";
import {buildOrderSlug} from "@/lib/slug";
import {AdminOrderStatusBadge} from "./AdminOrderStatusBadge";
import type {
  AdminOrderItem,
  AdminPaymentStatus,
} from "../types/IAdminOrder";
import {getSafeAdminOrderImageSrc} from "../utils/image";
import {sortArrayByLatestDate} from "@/lib/helper";

type AdminOrdersListProps = {
  orders: AdminOrderItem[];
};

const formatRentPeriod = (order: AdminOrderItem) => {
  return order.rentalDays
    ? `${order.rentalDays} day${order.rentalDays === 1 ? "" : "s"}`
    : "Not set";
};

const getCustomerName = (order: AdminOrderItem) => {
  if (!order.user) {
    return "Unknown customer";
  }

  return `${order.user.firstName} ${order.user.lastName}`;
};

export function AdminOrdersList({orders}: AdminOrdersListProps) {
  const [activeTab, setActiveTab] = useState<"rents" | "purchases">("rents");

  const rentOrders = orders.filter((o) => o.type === "rent");
  const buyOrders = orders.filter((o) => o.type === "purchase");
  const currentList = activeTab === "rents" ? rentOrders : buyOrders;

  const optionClass = (isActive: boolean) =>
    `flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`;

  const countClass = (isActive: boolean) =>
    `text-[11px] ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`;

  if (orders.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-6 py-16 text-center">
        <Receipt className="mb-4 size-9 text-muted-foreground" />
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          No orders yet
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Customer purchases and rentals will appear here.
        </p>
      </Card>
    );
  }

  const renderTable = (list: AdminOrderItem[]) => (
    <Card className="gap-0 overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-72">Order</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="min-w-36">Date</TableHead>
              {activeTab === "rents" && (
                <TableHead className="min-w-44">Rent period</TableHead>
              )}
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortArrayByLatestDate(list).map((order) => (
              <AdminOrderRow
                key={order._id}
                order={order}
                activeTab={activeTab}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex w-fit gap-1 rounded-full border border-border bg-muted/30 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("rents")}
          className={optionClass(activeTab === "rents")}
        >
          <CalendarClock
            className={`size-4 ${activeTab === "rents" ? "text-primary-foreground" : ""}`}
          />
          Rents
          <span className={countClass(activeTab === "rents")}>
            {rentOrders.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("purchases")}
          className={optionClass(activeTab === "purchases")}
        >
          <ShoppingBag
            className={`size-4 ${activeTab === "purchases" ? "text-primary-foreground" : ""}`}
          />
          Purchases
          <span className={countClass(activeTab === "purchases")}>
            {buyOrders.length}
          </span>
        </button>
      </div>

      <section>
        {currentList.length === 0 ? (
          <div className="rounded-lg border border-dashed px-5 py-12 text-center text-sm text-muted-foreground">
            No {activeTab === "rents" ? "rents" : "purchases"} yet.
          </div>
        ) : (
          renderTable(currentList)
        )}
      </section>
    </div>
  );
}

type AdminOrderRowProps = {
  order: AdminOrderItem;
  activeTab: "rents" | "purchases";
};

function AdminOrderRow({order, activeTab}: AdminOrderRowProps) {
  const router = useRouter();
  const firstItem = order.items[0];
  const itemCount = order.items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
  const paymentStatus: AdminPaymentStatus =
    order.payment?.status || (order.payment?.paidAt ? "paid" : "pending");
  const detailsHref = `/admin/orders/${buildOrderSlug(
    order.referenceID || firstItem?.name || "order",
    order._id,
  )}`;

  const openDetails = () => {
    router.push(detailsHref);
  };

  return (
    <TableRow
      tabIndex={0}
      role="link"
      aria-label={`View ${order.referenceID || "order"} details`}
      className="cursor-pointer outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50"
      onClick={openDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetails();
        }
      }}
    >
      <TableCell>
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/50">
            <Image
              src={getSafeAdminOrderImageSrc(firstItem?.imageURL)}
              alt={firstItem?.name || "Order item"}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{firstItem?.name || "Order"}</p>
            <p className="text-xs text-muted-foreground">
              {itemCount} item{itemCount === 1 ? "" : "s"} ·{" "}
              {order.referenceID || order._id}
            </p>
            <p className="max-w-52 truncate text-xs text-muted-foreground">
              Customer: {getCustomerName(order)}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-1.5 font-medium capitalize">
          {order.type === "rent" ? (
            <CalendarClock className="size-3.5 text-muted-foreground" />
          ) : (
            <ShoppingBag className="size-3.5 text-muted-foreground" />
          )}
          {order.type}
        </span>
      </TableCell>
      <TableCell>
        <AdminOrderStatusBadge status={order.status} />
      </TableCell>
      <TableCell>
        <PaymentStatusBadge status={paymentStatus} />
      </TableCell>
      <TableCell>{formatReadableDate(order.createdAt)}</TableCell>
      {activeTab === "rents" && (
        <TableCell>{formatRentPeriod(order)}</TableCell>
      )}
      <TableCell className="text-right font-medium tabular-nums">
        {formatCurrency(order.totalAmount)}
      </TableCell>
    </TableRow>
  );
}

function PaymentStatusBadge({status}: {status: AdminPaymentStatus}) {
  const variant: "default" | "secondary" | "destructive" | "outline" =
    status === "paid"
      ? "default"
      : status === "failed"
        ? "destructive"
        : status === "refunded"
          ? "secondary"
          : "outline";

  return <Badge variant={variant}>{formatStatusLabel(status)}</Badge>;
}