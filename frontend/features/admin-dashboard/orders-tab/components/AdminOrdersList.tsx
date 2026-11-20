import Image from "next/image";
import {useRouter} from "next/navigation";
import {useMemo, useState} from "react";
import {
  CalendarClock,
  Layers,
  Receipt,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {AdminEmptyState} from "@/features/admin-dashboard/components/AdminEmptyState";
import {AdminSearchInput} from "@/features/admin-dashboard/components/AdminSearchInput";
import {AdminSegmented} from "@/features/admin-dashboard/components/AdminSegmented";
import {
  formatCurrency,
  formatReadableDate,
  formatStatusLabel,
} from "@/lib/formatters";
import {buildAdminOrderPath} from "@/lib/reference-path";
import {
  getOrderDisplayIdentity,
  resolveOrderPackages,
  type PackageSource,
} from "@/lib/package-identity";
import {AdminOrderStatusBadge} from "./AdminOrderStatusBadge";
import type {AdminOrderItem, AdminOrderStatus} from "../types/IAdminOrder";
import {getSafeAdminOrderImageSrc} from "../utils/image";
import {sortArrayByLatestDate} from "@/lib/helper";
import {getOutfitBranchLabel} from "@/features/admin-dashboard/inventory-tab/constants/constants";

type OrderTab = "all" | "rents" | "purchases";

type AdminOrdersListProps = {
  orders: AdminOrderItem[];
  packages: PackageSource[];
};

const STATUS_FILTER_OPTIONS = [
  {value: "all", label: "All"},
  {value: "pending", label: formatStatusLabel("pending")},
  {value: "ready", label: formatStatusLabel("ready")},
  {value: "received", label: formatStatusLabel("received")},
  {value: "active", label: formatStatusLabel("active")},
  {value: "overdue", label: formatStatusLabel("overdue")},
  {value: "returned", label: formatStatusLabel("returned")},
  {value: "cancelled", label: formatStatusLabel("cancelled")},
] as const;

const formatRentPeriod = (order: AdminOrderItem) => {
  return order.eventDate
    ? formatReadableDate(order.eventDate)
    : "Not set";
};

const getCustomerName = (order: AdminOrderItem) => {
  if (!order.user) {
    return "Unknown customer";
  }

  return `${order.user.firstName} ${order.user.lastName}`;
};

const matchesSearch = (
  order: AdminOrderItem,
  packages: PackageSource[],
  query: string,
) => {
  const identity = getOrderDisplayIdentity(
    order,
    resolveOrderPackages(order, packages),
  );

  return [
    getCustomerName(order),
    order.user?.email ?? "",
    identity.name,
    order.referenceID ?? "",
    order._id,
    order.type,
    order.status,
    order.paymentMethod ?? "",
    order.payment?.method ?? "",
    order.payment?.referenceID ?? "",
    ...order.items.flatMap((item) => [
      item.name,
      item.category,
      getOutfitBranchLabel(item.branch) ?? "",
      item.outfitReferenceID ?? "",
    ]),
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
};

export function AdminOrdersList({orders, packages}: AdminOrdersListProps) {
  const [activeTab, setActiveTab] = useState<OrderTab>("all");
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter(
      (order) =>
        (statusFilter === "all" || order.status === statusFilter) &&
        (!query || matchesSearch(order, packages, query)),
    );
  }, [orders, packages, search, statusFilter]);

  const hasActiveFilters =
    activeTab !== "all" || statusFilter !== "all" || search.trim() !== "";
  const clearFilters = () => {
    setActiveTab("all");
    setStatusFilter("all");
    setSearch("");
  };

  const rentOrders = filteredOrders.filter((o) => o.type === "rent");
  const buyOrders = filteredOrders.filter((o) => o.type === "purchase");
  const currentList =
    activeTab === "rents"
      ? rentOrders
      : activeTab === "purchases"
        ? buyOrders
        : filteredOrders;

  // The whole list is empty, so the tabs above have nothing to switch between
  // either - show one message instead of a tab bar over a void.
  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-primary md:text-2xl">
          All orders
        </h2>
        <AdminEmptyState
          icon={Receipt}
          title="No orders yet"
          description="Customer purchases and rentals will appear here."
        />
      </div>
    );
  }

  // Cream surface with no border, ring, or row lines: spacing and a soft hover
  // carry the structure.
  const renderTable = (list: AdminOrderItem[]) => (
    <Card className="gap-0 overflow-hidden rounded-lg border-0 bg-card ring-1 ring-border/60">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="[&_tr]:border-0">
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="min-w-72">Order</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="min-w-36">Date</TableHead>
              {activeTab === "rents" && (
                <TableHead className="min-w-44">Event date</TableHead>
              )}
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr]:border-0">
            {sortArrayByLatestDate(list).map((order) => (
              <AdminOrderRow
                key={order._id}
                order={order}
                showEventDate={activeTab === "rents"}
                packages={packages}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-primary md:text-2xl">
            All orders
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <AdminSearchInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search customer, item, reference…"
            wrapperClassName="w-full sm:w-56"
            className="h-8"
            aria-label="Search orders"
          />

          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-2"
              >
                <SlidersHorizontal className="size-3.5" />
                Filters
                {hasActiveFilters ? (
                  <span className="size-1.5 rounded-full bg-primary" />
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 space-y-3 p-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  Order type
                </p>
                <AdminSegmented
                  size="sm"
                  variant="pills"
                  aria-label="Order type"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  options={[
                    {
                      value: "all",
                      label: "All",
                      icon: Layers,
                      count: filteredOrders.length,
                    },
                    {
                      value: "rents",
                      label: "Rents",
                      icon: CalendarClock,
                      count: rentOrders.length,
                    },
                    {
                      value: "purchases",
                      label: "Purchases",
                      icon: ShoppingBag,
                      count: buyOrders.length,
                    },
                  ]}
                  className="flex-wrap"
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  Status
                </p>
                <AdminSegmented
                  size="sm"
                  variant="pills"
                  aria-label="Order status"
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  options={STATUS_FILTER_OPTIONS}
                  className="flex-wrap [&>button]:min-w-24"
                />
              </div>
              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    clearFilters();
                    setFiltersOpen(false);
                  }}
                >
                  Clear filters
                </Button>
              ) : null}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <section>
        {/* One tab is empty but the other is not, so the tab bar stays and this
            sits in the section below it rather than replacing the list. */}
        {currentList.length === 0 ? (
          <AdminEmptyState
            className="min-h-72"
            icon={Receipt}
            title="No orders match these filters"
            description="Try a different search, status, or order type."
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          renderTable(currentList)
        )}
      </section>
    </div>
  );
}

type AdminOrderRowProps = {
  order: AdminOrderItem;
  showEventDate: boolean;
  packages: PackageSource[];
};

function AdminOrderRow({order, showEventDate, packages}: AdminOrderRowProps) {
  const router = useRouter();
  const resolved = useMemo(
    () => resolveOrderPackages(order, packages),
    [order, packages],
  );
  const identity = getOrderDisplayIdentity(order, resolved);
  const itemCount = order.items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
  const detailsHref = buildAdminOrderPath(order.referenceID) || "/admin/orders";

  const openDetails = () => {
    router.push(detailsHref);
  };

  return (
    <TableRow
      tabIndex={0}
      role="link"
      aria-label={`View ${order.referenceID || "order"} details`}
      className="cursor-pointer border-0 outline-none transition-colors hover:bg-background-hover focus-visible:bg-background-hover"
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
          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-background">
            <Image
              src={getSafeAdminOrderImageSrc(identity.imageURL)}
              alt={identity.name || "Order item"}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate font-semibold text-primary">
                {identity.name || "Order"}
              </p>
              {identity.isPackage && (
                <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                  Package
                </span>
              )}
            </div>
            <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              <span>
                {itemCount} item{itemCount === 1 ? "" : "s"}
              </span>
              <span>{order.referenceID || order._id}</span>
            </p>
            <p className="max-w-52 truncate text-xs text-muted-foreground">
              Customer: {getCustomerName(order)}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="font-medium capitalize">{order.type}</TableCell>
      <TableCell>
        <AdminOrderStatusBadge status={order.status} type={order.type} />
      </TableCell>
      <TableCell>{formatReadableDate(order.createdAt)}</TableCell>
      {showEventDate && <TableCell>{formatRentPeriod(order)}</TableCell>}
      <TableCell className="text-right font-semibold text-primary tabular-nums">
        {formatCurrency(order.totalAmount)}
      </TableCell>
    </TableRow>
  );
}
