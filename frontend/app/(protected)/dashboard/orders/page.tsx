"use client";

import {useState} from "react";
import {Skeleton} from "@/components/ui/skeleton";
import {AlertCircle, CalendarClock, Layers, ShoppingBag, SlidersHorizontal} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {AdminSearchInput} from "@/features/admin-dashboard/components/AdminSearchInput";
import {AdminSegmented} from "@/features/admin-dashboard/components/AdminSegmented";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {OrdersList} from "@/features/user-dashboard/orders/components/OrdersList";
import {OrdersStats} from "@/features/user-dashboard/orders/components/OrdersStats";
import {fetchOrdersByUserIdService} from "@/features/user-dashboard/orders/services/orderService";
import {IOrder} from "@/features/user-dashboard/buy/types/IOrder";
import {IRent} from "@/features/user-dashboard/rent/types/IRent";
import {useQuery} from "@tanstack/react-query";
import {motion} from "framer-motion";
import {fadeInUp} from "@/components/motion";
import {sortArrayByLatestDate} from "@/lib/helper";
import {usePackages} from "@/features/admin-dashboard/packages/hooks/usePackages";
import {formatStatusLabel} from "@/lib/formatters";
import {getOrderDisplayIdentity, resolveOrderPackages} from "@/lib/package-identity";

const orderTypes = [
  {value: "all", label: "All", icon: Layers},
  {value: "purchase", label: "Purchases", icon: ShoppingBag},
  {value: "rent", label: "Rentals", icon: CalendarClock},
] as const;

const statuses = [
  "all", "pending", "reserved", "ready", "received", "active", "overdue", "returned", "cancelled",
] as const;
const statusOptions = statuses.map((value) => ({value, label: formatStatusLabel(value)}));

export default function OrdersPage() {
  const {user} = useAuth();
  const [activeFilter, setActiveFilter] = useState<"all" | "purchase" | "rent">(
    "all",
  );
  const [status, setStatus] = useState<(typeof statuses)[number]>("all");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const {
    data: ordersData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-orders", user?._id],
    queryFn: () => fetchOrdersByUserIdService(user!._id!),
    enabled: Boolean(user?._id),
  });
  const orders: (IRent | IOrder)[] = ordersData
    ? [...ordersData.orders, ...ordersData.rents]
    : [];

  // Package orders only store their costumes, so the package they belong to is
  // resolved from the package list.
  const {data: packages = []} = usePackages();

  const query = search.trim().toLowerCase();
  const hasActiveFilters = activeFilter !== "all" || status !== "all";
  const filteredOrders = sortArrayByLatestDate(orders.filter((item) => {
    if (activeFilter !== "all" && item.type !== activeFilter) return false;
    if (status !== "all" && item.status !== status) return false;
    if (!query) return true;

    const identity = getOrderDisplayIdentity(item, resolveOrderPackages(item, packages));
    return [item.referenceID, item._id, identity.name, ...item.items.map((outfit) => outfit.name)]
      .some((value) => value?.toLowerCase().includes(query));
  }));

  const clearFilters = () => {
    setActiveFilter("all");
    setStatus("all");
  };

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Page Header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            My Orders
          </h1>
          <p className="mt-1.5 text-base text-secondary/80 leading-relaxed">
            Transactions to track your costume purchases and rentals
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <OrdersStats items={orders} isLoading={isLoading} />

      {/* Filter + List */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 sm:justify-end">
          <AdminSearchInput
            value={search}
            onValueChange={setSearch}
            wrapperClassName="sm:flex-none sm:w-64"
            aria-label="Search orders"
          />
          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-2 bg-background hover:border-secondary hover:bg-secondary hover:text-secondary-foreground"
              >
                <SlidersHorizontal className="size-3.5" />
                Filters
                {hasActiveFilters && <span className="size-1.5 rounded-full bg-accent" />}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 max-w-[calc(100vw-2rem)] space-y-3 p-3">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-secondary">Order type</p>
                <AdminSegmented
                  size="sm"
                  variant="pills"
                  aria-label="Order type"
                  value={activeFilter}
                  onValueChange={setActiveFilter}
                  options={orderTypes}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-secondary">Status</p>
                <AdminSegmented
                  size="sm"
                  variant="pills"
                  aria-label="Order status"
                  value={status}
                  onValueChange={setStatus}
                  options={statusOptions}
                  className="[&>button]:min-w-24"
                />
              </div>
              {hasActiveFilters && (
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
              )}
            </PopoverContent>
          </Popover>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <ErrorState message="Unable to fetch orders." />
        ) : (
          <OrdersList
            items={filteredOrders}
            packages={packages}
            onShowAll={orders.length > 0 && (hasActiveFilters || query) ? () => {
              clearFilters();
              setSearch("");
            } : undefined}
          />
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({length: 3}).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border border-border bg-background p-4"
          style={{opacity: 1 - i * 0.2}}
        >
          <Skeleton className="size-24 shrink-0 rounded-lg" />
          <div className="flex flex-1 flex-col gap-2.5">
            <Skeleton className="h-4 w-2/5 rounded-md" />
            <Skeleton className="h-3 w-1/3 rounded-md" />
            <Skeleton className="h-3 w-1/4 rounded-md" />
          </div>
          <Skeleton className="h-5 w-20 shrink-0 rounded-md" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({message}: {message: string}) {
  return (
    <section className="min-w-0">
      <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-5 text-destructive" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            Something went wrong
          </p>
          <p className="text-base text-secondary/80 leading-relaxed">{message}</p>
        </div>
      </div>
    </section>
  );
}
