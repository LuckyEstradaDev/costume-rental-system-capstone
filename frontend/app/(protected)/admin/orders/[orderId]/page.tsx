"use client";

import {useEffect, useState} from "react";
import Image from "next/image";
import {useParams, useRouter} from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Package,
  ShoppingBag,
  User,
  XCircle,
} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Separator} from "@/components/ui/separator";
import {
  formatCurrency,
  formatReadableDateTime,
  formatStatusLabel,
} from "@/lib/formatters";
import {AdminOrderStatusBadge} from "@/features/admin-dashboard/orders-tab/components/AdminOrderStatusBadge";
import {
  fetchAdminOrderByIdService,
  markAdminOrderPaymentPaidService,
  updateAdminOrderStatusService,
} from "@/features/admin-dashboard/orders-tab/services/adminOrderService";
import type {
  AdminOrderItem,
  AdminOrderStatus,
} from "@/features/admin-dashboard/orders-tab/types/IAdminOrder";
import {getSafeAdminOrderImageSrc} from "@/features/admin-dashboard/orders-tab/utils/image";

const getStatuses = (order: AdminOrderItem) => {
  if (order.type === "rent") {
    if (order.status === "pending") {
      return ["active", "cancelled"] as AdminOrderStatus[];
    }

    if (order.status === "active") {
      return ["returned"] as AdminOrderStatus[];
    }

    return [] as AdminOrderStatus[];
  }

  if (order.status === "pending") {
    return ["received", "cancelled"] as AdminOrderStatus[];
  }

  return [] as AdminOrderStatus[];
};

const getStatusActionLabel = (status: AdminOrderStatus) => {
  const labels: Record<AdminOrderStatus, string> = {
    pending: "Mark pending",
    received: "Mark received",
    active: "Mark picked up",
    overdue: "Mark overdue",
    returned: "Mark returned",
    cancelled: "Cancel order",
  };

  return labels[status];
};

const getCustomerName = (order: AdminOrderItem) => {
  if (!order.user) {
    return "Unknown customer";
  }

  return `${order.user.firstName} ${order.user.lastName}`;
};

export default function AdminOrderDetailsPage() {
  const router = useRouter();
  const params = useParams<{orderId: string}>();
  const orderId = params.orderId;
  const [order, setOrder] = useState<AdminOrderItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCashDialogOpen, setIsCashDialogOpen] = useState(false);
  const [cashAmount, setCashAmount] = useState("");
  const [cashError, setCashError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const {data} = await fetchAdminOrderByIdService(orderId);
        setOrder(data.data);
      } catch {
        setErrorMessage("Unable to fetch order details.");
      }

      setIsLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  const handleStatusChange = async (status: AdminOrderStatus) => {
    if (!order) {
      return;
    }

    setIsUpdating(true);
    setErrorMessage("");

    try {
      const {data} = await updateAdminOrderStatusService(order._id, status);
      // Always preserve the payment data - merge new status data with existing payment
      setOrder({
        ...data.data,
        payment: {
          ...order.payment,
          ...data.data.payment,
        },
        user: order.user,
      });
    } catch {
      setErrorMessage("Unable to update order status.");
    }

    setIsUpdating(false);
  };

  const handleMarkPaymentPaid = async (cash?: number) => {
    if (!order) {
      return;
    }

    setIsUpdating(true);
    setErrorMessage("");

    try {
      const {data} = await markAdminOrderPaymentPaidService(
        order._id,
        cash,
        order.payment?.method,
      );
      setOrder({...data.data, user: order.user});
      setIsCashDialogOpen(false);
      setCashAmount("");
      setCashError("");
    } catch {
      setErrorMessage("Unable to mark payment as paid.");
    }

    setIsUpdating(false);
  };

  const handlePaidButtonClick = () => {
    if (order?.payment?.method === "cash") {
      setCashAmount("");
      setCashError("");
      setIsCashDialogOpen(true);
      return;
    }

    void handleMarkPaymentPaid();
  };

  const handleConfirmCashPayment = async () => {
    if (!order) {
      return;
    }

    const cash = Number(cashAmount);

    if (!Number.isFinite(cash) || cash < order.totalAmount) {
      setCashError("Cash must be at least the order total.");
      return;
    }

    await handleMarkPaymentPaid(cash);
  };

  if (isLoading) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        Loading order...
      </Card>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/orders")}
        >
          <ArrowLeft className="size-4" />
          Back to orders
        </Button>
        <Card className="p-6 text-center text-muted-foreground">
          {errorMessage || "Order not found."}
        </Card>
      </div>
    );
  }

  const firstItem = order.items[0];
  const itemCount = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const paymentStatus =
    order.payment?.status || (order.payment?.paidAt ? "paid" : "pending");
  const paymentMethod = order.payment?.method || "Not set";
  const canMarkPaymentPaid =
    order.payment?.status !== "paid" && !order.payment?.paidAt;
  const cashValue = Number(cashAmount);
  const cashChange =
    Number.isFinite(cashValue) && cashValue >= order.totalAmount
      ? cashValue - order.totalAmount
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/orders")}
          >
            <ArrowLeft className="size-4" />
            Back to orders
          </Button>
          <h1 className="mt-4 text-3xl font-bold">Order details</h1>
          <p className="mt-1 text-muted-foreground">{order.referenceID}</p>
        </div>
        <AdminOrderStatusBadge status={order.status} />
      </div>

      {errorMessage && (
        <Card className="p-4 text-destructive">{errorMessage}</Card>
      )}

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
                <p className="font-semibold capitalize">{order.type}</p>
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
          <InfoItem
            icon={User}
            label="Customer"
            value={getCustomerName(order)}
          />
          <InfoItem
            icon={Package}
            label="Created"
            value={formatReadableDateTime(order.createdAt)}
          />
          <InfoItem
            icon={Package}
            label="Payment"
            value={formatStatusLabel(paymentStatus)}
          />
          {order.payment?.cash !== undefined && (
            <InfoItem
              icon={CreditCard}
              label="Cash"
              value={formatCurrency(order.payment.cash)}
            />
          )}
          {order.payment?.change !== undefined && (
            <InfoItem
              icon={CreditCard}
              label="Change"
              value={formatCurrency(order.payment.change)}
            />
          )}
          {order.type === "rent" ? (
            <>
              <InfoItem
                icon={CalendarClock}
                label="Rental days"
                value={
                  order.rentalDays ? `${order.rentalDays} day(s)` : "Not set"
                }
              />
              <InfoItem
                icon={CalendarClock}
                label="Pickup time"
                value={formatReadableDateTime(order.pickupTime)}
              />
              <InfoItem
                icon={CalendarClock}
                label="Return time"
                value={formatReadableDateTime(order.returnTime)}
              />
            </>
          ) : (
            <InfoItem icon={Package} label="Type" value="Purchase" />
          )}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <ActionGroup
            icon={CreditCard}
            title="Payment"
            detail={`${paymentMethod} - ${formatStatusLabel(paymentStatus)}`}
          >
            {order.payment?.status === "paid" || order.payment?.paidAt ? (
              <Badge variant="secondary">
                Paid
                {order.payment?.paidAt
                  ? ` ${formatReadableDateTime(order.payment.paidAt)}`
                  : ""}
              </Badge>
            ) : (
              <>
                <Badge variant="outline">Awaiting payment</Badge>
                {canMarkPaymentPaid && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={isUpdating}
                    onClick={handlePaidButtonClick}
                  >
                    <CheckCircle2 className="size-4" />
                    Mark as paid
                  </Button>
                )}
              </>
            )}
          </ActionGroup>

          <ActionGroup
            icon={order.type === "rent" ? CalendarClock : Package}
            title={order.type === "rent" ? "Rental progress" : "Order progress"}
            detail={
              order.type === "rent"
                ? "Move the rental from pending to picked up, then returned."
                : "Move the order from pending to received."
            }
          >
            {getStatuses(order).map((status) => (
              <Button
                key={status}
                type="button"
                variant={
                  status === "cancelled"
                    ? "destructive"
                    : order.status === status
                      ? "default"
                      : "outline"
                }
                size="sm"
                disabled={isUpdating || order.status === status}
                onClick={() => handleStatusChange(status)}
              >
                {status === "cancelled" ? (
                  <XCircle className="size-4" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                {getStatusActionLabel(status)}
              </Button>
            ))}
          </ActionGroup>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold">Items</h2>
        <div className="mt-3 space-y-3">
          {order.items.map((item, index) => {
            const itemTotal = Number(item.price) * item.quantity;

            return (
              <div
                key={`${item.outfitId}-${item.variantId}-${index}`}
                className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={getSafeAdminOrderImageSrc(item.imageURL)}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.category} - Size {item.size} - {item.color}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Qty {item.quantity} x {formatCurrency(Number(item.price))}
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

      <Dialog open={isCashDialogOpen} onOpenChange={setIsCashDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cash payment</DialogTitle>
            <DialogDescription>
              Enter the cash received from the customer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid gap-1.5">
              <Label htmlFor="cashAmount">Customer cash</Label>
              <Input
                id="cashAmount"
                type="number"
                min={order.totalAmount}
                step="0.01"
                value={cashAmount}
                onChange={(event) => {
                  setCashAmount(event.target.value);
                  setCashError("");
                }}
                placeholder={String(order.totalAmount)}
              />
            </div>
            <div className="rounded-lg border p-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
              <div className="mt-1 flex justify-between gap-3">
                <span className="text-muted-foreground">Change</span>
                <span className="font-medium">
                  {formatCurrency(cashChange)}
                </span>
              </div>
            </div>
            {cashError && (
              <p className="text-sm text-destructive">{cashError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isUpdating}
              onClick={() => setIsCashDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isUpdating}
              onClick={handleConfirmCashPayment}
            >
              <CheckCircle2 className="size-4" />
              Confirm payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type InfoItemProps = {
  icon: React.ComponentType<{className?: string}>;
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

type ActionGroupProps = {
  icon: React.ComponentType<{className?: string}>;
  title: string;
  detail: string;
  children: React.ReactNode;
};

function ActionGroup({icon: Icon, title, detail, children}: ActionGroupProps) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{detail}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
