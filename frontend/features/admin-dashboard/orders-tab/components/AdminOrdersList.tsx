import Image from "next/image";
import {useRouter} from "next/navigation";
import {Card} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {
  formatCurrency,
  formatReadableDate,
  formatStatusLabel,
} from "@/lib/formatters";
import {AdminOrderStatusBadge} from "./AdminOrderStatusBadge";
import type {AdminOrderItem} from "../types/IAdminOrder";
import {getSafeAdminOrderImageSrc} from "../utils/image";

type AdminOrdersListProps = {
  orders: AdminOrderItem[];
};

const formatRentPeriod = (order: AdminOrderItem) => {
  if (order.pickupTime && order.returnTime) {
    return `${formatReadableDate(order.pickupTime)} to ${formatReadableDate(order.returnTime)}`;
  }

  if (order.pickupTime) {
    return `${formatReadableDate(order.pickupTime)} pickup`;
  }

  return order.rentalDays ? `${order.rentalDays} day(s)` : "Not set";
};

const getCustomerName = (order: AdminOrderItem) => {
  if (!order.user) {
    return "Unknown customer";
  }

  return `${order.user.firstName} ${order.user.lastName}`;
};

export function AdminOrdersList({orders}: AdminOrdersListProps) {
  if (orders.length === 0) {
    return (
      <Card className="p-4 text-center text-muted-foreground">
        No orders or rents yet.
      </Card>
    );
  }

  const rentOrders = orders.filter((o) => o.type === "rent");
  const buyOrders = orders.filter((o) => o.type === "buy");

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [activeTab, setActiveTab] = useState<"rents" | "purchases">("rents");

  const renderTable = (list: AdminOrderItem[]) => (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-72">Order</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="min-w-36">Date</TableHead>
            <TableHead className="min-w-44">Rent period</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .map((order) => (
              <AdminOrderRow key={order._id} order={order} />
            ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={activeTab === "rents" ? "default" : "outline"}
            onClick={() => setActiveTab("rents")}
          >
            Rents ({rentOrders.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === "purchases" ? "default" : "outline"}
            onClick={() => setActiveTab("purchases")}
          >
            Purchases ({buyOrders.length})
          </Button>
        </div>
      </div>

      <section>
        {activeTab === "rents" ? (
          rentOrders.length === 0 ? (
            <Card className="p-4 text-center text-muted-foreground">
              No rents yet.
            </Card>
          ) : (
            <Card className="p-4">{renderTable(rentOrders)}</Card>
          )
        ) : buyOrders.length === 0 ? (
          <Card className="p-4 text-center text-muted-foreground">
            No purchases yet.
          </Card>
        ) : (
          <Card className="p-4">{renderTable(buyOrders)}</Card>
        )}
      </section>
    </div>
  );
}

type AdminOrderRowProps = {
  order: AdminOrderItem;
};

function AdminOrderRow({order}: AdminOrderRowProps) {
  const router = useRouter();
  const firstItem = order.items[0];
  const itemCount = order.items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
  const paymentStatus =
    order.payment?.status || (order.payment?.paidAt ? "paid" : "pending");
  const detailsHref = `/admin/orders/${order._id}`;

  const openDetails = () => {
    router.push(detailsHref);
  };

  return (
    <TableRow
      tabIndex={0}
      role="link"
      className="cursor-pointer hover:bg-muted/50"
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
          <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
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
              {itemCount} item{itemCount === 1 ? "" : "s"} -{" "}
              {order.referenceID || order._id}
            </p>
            <p className="max-w-52 truncate text-xs text-muted-foreground">
              Customer: {getCustomerName(order)}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="capitalize">{order.type}</TableCell>
      <TableCell>
        <AdminOrderStatusBadge status={order.status} />
      </TableCell>
      <TableCell>{formatStatusLabel(paymentStatus)}</TableCell>
      <TableCell>{formatReadableDate(order.createdAt)}</TableCell>
      <TableCell>
        {order.type === "rent" ? formatRentPeriod(order) : "Purchase"}
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(order.totalAmount)}
      </TableCell>
    </TableRow>
  );
}
