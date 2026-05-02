import Image from "next/image";
import {ChevronDown} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {AdminOrderStatusBadge} from "./AdminOrderStatusBadge";
import type {
  AdminOrderItem,
  AdminOrderStatus,
  AdminOrderType,
} from "../types/IAdminOrder";
import {getSafeAdminOrderImageSrc} from "../utils/image";

type AdminOrdersListProps = {
  orders: AdminOrderItem[];
  updatingOrderId: string;
  onStatusChange: (order: AdminOrderItem, status: AdminOrderStatus) => void;
};

const buyStatuses: AdminOrderStatus[] = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
];

const rentStatuses: AdminOrderStatus[] = [
  "pending",
  "active",
  "overdue",
  "returned",
  "cancelled",
];

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const formatDate = (value?: string) => {
  if (!value) {
    return "Not set";
  }

  return dateFormatter.format(new Date(value));
};

const getStatuses = (type: AdminOrderType) => {
  return type === "rent" ? rentStatuses : buyStatuses;
};

const getCustomerName = (order: AdminOrderItem) => {
  if (!order.user) {
    return "Unknown customer";
  }

  return `${order.user.firstName} ${order.user.lastName}`;
};

export function AdminOrdersList({
  orders,
  updatingOrderId,
  onStatusChange,
}: AdminOrdersListProps) {
  if (orders.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        No orders or rents yet.
      </Card>
    );
  }

  return (
    <Card className="p-0">
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
          {orders.map((order) => (
            <AdminOrderRow
              key={order._id}
              order={order}
              isUpdating={updatingOrderId === order._id}
              onStatusChange={onStatusChange}
            />
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

type AdminOrderRowProps = {
  order: AdminOrderItem;
  isUpdating: boolean;
  onStatusChange: (order: AdminOrderItem, status: AdminOrderStatus) => void;
};

function AdminOrderRow({
  order,
  isUpdating,
  onStatusChange,
}: AdminOrderRowProps) {
  const firstItem = order.items[0];
  const itemCount = order.items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
  const paymentStatus = order.payment?.paidAt ? "Paid" : "Unpaid";

  return (
    <TableRow>
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
              {itemCount} item{itemCount === 1 ? "" : "s"} - {order._id}
            </p>
            <p className="max-w-52 truncate text-xs text-muted-foreground">
              Customer: {getCustomerName(order)}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="capitalize">{order.type}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" disabled={isUpdating}>
              <AdminOrderStatusBadge status={order.status} />
              <ChevronDown className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {getStatuses(order.type).map((status) => (
              <DropdownMenuItem
                key={status}
                disabled={order.status === status}
                onClick={() => onStatusChange(order, status)}
              >
                {status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
      <TableCell>{paymentStatus}</TableCell>
      <TableCell>{formatDate(order.createdAt)}</TableCell>
      <TableCell>
        {order.type === "rent"
          ? `${formatDate(order.rentStart)} to ${formatDate(order.rentEnd)}`
          : "Purchase"}
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(order.totalAmount)}
      </TableCell>
    </TableRow>
  );
}
