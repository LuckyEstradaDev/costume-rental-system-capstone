import Image from "next/image";
import type {ComponentType} from "react";
import {CalendarClock, Package, ShoppingBag, User} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {
  formatCurrency,
  formatReadableDateTime,
  formatStatusLabel,
} from "@/lib/formatters";
import {AdminOrderStatusBadge} from "./AdminOrderStatusBadge";
import type {
  AdminOrderItem,
  AdminOrderStatus,
  AdminOrderType,
} from "../types/IAdminOrder";
import {getSafeAdminOrderImageSrc} from "../utils/image";

type AdminOrderCardProps = {
  order: AdminOrderItem;
  isUpdating: boolean;
  onStatusChange: (order: AdminOrderItem, status: AdminOrderStatus) => void;
};

const buyStatuses: AdminOrderStatus[] = [
  "pending",
  "received",
  "cancelled",
];

const rentStatuses: AdminOrderStatus[] = [
  "pending",
  "active",
  "overdue",
  "returned",
  "cancelled",
];

const formatRentPeriod = (order: AdminOrderItem) => {
  if (order.pickupTime && order.returnTime) {
    return `${formatReadableDateTime(order.pickupTime)} to ${formatReadableDateTime(order.returnTime)}`;
  }

  if (order.pickupTime) {
    return `${formatReadableDateTime(order.pickupTime)} pickup`;
  }

  return order.rentalDays ? `${order.rentalDays} day(s)` : "Not set";
};

const getStatuses = (type: AdminOrderType) => {
  return type === "rent" ? rentStatuses : buyStatuses;
};

export function AdminOrderCard({
  order,
  isUpdating,
  onStatusChange,
}: AdminOrderCardProps) {
  const firstItem = order.items[0];
  const itemCount = order.items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
  const paymentStatus =
    order.payment?.status || (order.payment?.paidAt ? "paid" : "pending");

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image
              src={getSafeAdminOrderImageSrc(firstItem?.imageURL)}
              alt={firstItem?.name || "Order item"}
              fill
              className="object-cover"
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {order.type === "rent" ? (
                <CalendarClock className="size-4 text-muted-foreground" />
              ) : (
                <ShoppingBag className="size-4 text-muted-foreground" />
              )}
              <p className="font-semibold">{order._id}</p>
              <AdminOrderStatusBadge status={order.status} />
            </div>
            <p className="mt-1 font-medium">{firstItem?.name || "Order"}</p>
            <p className="text-sm text-muted-foreground">
              {itemCount} item{itemCount === 1 ? "" : "s"} -{" "}
              {formatStatusLabel(paymentStatus)}
            </p>
          </div>
        </div>

        <div className="text-left lg:text-right">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-lg font-bold">
            {formatCurrency(order.totalAmount)}
          </p>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="grid gap-3 text-sm md:grid-cols-3">
        <InfoItem icon={User} label="User ID" value={order.userID} />
        <InfoItem
          icon={Package}
          label="Created"
          value={formatReadableDateTime(order.createdAt)}
        />
        {order.type === "rent" ? (
          <InfoItem
            icon={CalendarClock}
            label="Rent period"
            value={formatRentPeriod(order)}
          />
        ) : (
          <InfoItem icon={Package} label="Type" value="Purchase" />
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {getStatuses(order.type).map((status) => (
          <Button
            key={status}
            type="button"
            variant={order.status === status ? "default" : "outline"}
            size="sm"
            disabled={isUpdating || order.status === status}
            onClick={() => onStatusChange(order, status)}
          >
            {formatStatusLabel(status)}
          </Button>
        ))}
      </div>
    </Card>
  );
}

type InfoItemProps = {
  icon: ComponentType<{className?: string}>;
  label: string;
  value: string;
};

function InfoItem({icon: Icon, label, value}: InfoItemProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-medium">{value}</p>
      </div>
    </div>
  );
}
