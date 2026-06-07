"use client";

import {
  sortOrdersRents,
  sortRevenue,
} from "@/features/admin-dashboard/dashboard/utils/helpers";

import {
  CalendarClock,
  PackageCheck,
  ReceiptText,
  Shirt,
  Users,
  LayoutDashboard,
} from "lucide-react";
import {Card} from "@/components/ui/card";
import {useEffect, useState} from "react";
import {
  getAllActiveRentsService,
  getAllOrdersService,
  getAllPaymentsService,
  getUserCountService,
} from "@/features/admin-dashboard/dashboard/services/services";
import UsersOvertimeChart from "@/features/admin-dashboard/dashboard/components/UsersOvertimeChart";
import RevenueChart from "@/features/admin-dashboard/dashboard/components/RevenueChart";
import {MONTH_LABELS} from "@/features/admin-dashboard/dashboard/data/chartlabels";
import Orders_RentsChart from "@/features/admin-dashboard/dashboard/components/Orders_RentsChart";
import {Button} from "@/components/ui/button";
import PaymentStatusPieChart from "@/features/admin-dashboard/dashboard/components/PaymentStatusPieChart";
import RentalBarChart from "@/features/admin-dashboard/dashboard/components/RentalBarChart";
import {fetchOutfitStats} from "@/features/admin-dashboard/inventory-tab/services/outfitService";

export default function AdminDashboardPage() {
  const [revenueByDate, setRevenueByDate] = useState<Record<string, number>>(
    {},
  );
  const [ordersByDate, setOrdersByDate] = useState<Record<string, number>>({});
  const [rentsByDate, setRentsByDate] = useState<Record<string, number>>({});
  const [payments, setPayments] = useState<
    {createdAt: string; totalAmount: string; status: string}[]
  >([]);
  const [orders, setOrders] = useState<{createdAt: string}[]>([]);
  const [rents, setRents] = useState<{createdAt: string}[]>([]);
  const [sortFilter, setSortFilter] = useState<"Day" | "Month" | "Year">("Day");
  const [dateLabels, setDateLabels] = useState<string[]>([]);
  const [chartTitle, setChartTitle] = useState<string>("Daily Revenue");
  const [outfitStats, setOutfitStats] = useState<{
    totalOutfits: string;
    rentedOutfits: string;
    lowStockOutfits: {count: string}[];
  }>();
  const [usersByDate, setUsersByDate] = useState<Record<string, number>>({});

  const totalRevenue = Object.values(revenueByDate).reduce(
    (sum, v) => sum + (Number(v) || 0),
    0,
  );

  const [stats, setStats] = useState([
    {
      id: 1,
      label: "Active rentals",
      value: "0",
      detail: "6 due this week",
      icon: CalendarClock,
    },
    {
      id: 2,
      label: "Pending orders",
      value: "0",
      detail: "4 awaiting payment",
      icon: PackageCheck,
    },
    {
      id: 3,
      label: "Monthly revenue",
      value: "0",
      detail: "+12% from last month",
      icon: ReceiptText,
    },
    {
      id: 4,
      label: "Customers",
      value: "0",
      detail: "19 new this month",
      icon: Users,
    },
  ]);

  useEffect(() => {
    const revenueByDate = sortRevenue(payments, sortFilter);
    const ordersByDate = sortOrdersRents(orders, sortFilter);
    const rentsByDate = sortOrdersRents(rents, sortFilter);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRevenueByDate(revenueByDate);
    setRentsByDate(rentsByDate);
    setOrdersByDate(ordersByDate);

    if (sortFilter === "Day") {
      setChartTitle(`Daily Revenue`);
      setDateLabels(Object.keys(revenueByDate));
    } else if (sortFilter === "Month") {
      setChartTitle(`Monthly Revenue`);
      setDateLabels(MONTH_LABELS);
    } else if (sortFilter === "Year") {
      setChartTitle(`Yearly Revenue`);
      setDateLabels(Object.keys(revenueByDate));
    }
  }, [sortFilter, payments]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const rents = await getAllActiveRentsService();
        const orders = await getAllOrdersService();
        const users = await getUserCountService();
        const payments = await getAllPaymentsService();
        const outfitStats = await fetchOutfitStats();
        setOutfitStats(outfitStats.data);
        setPayments(payments);
        setOrders(orders.allOrders);
        setRents(rents.allRents);

        const revenueByDate = sortRevenue(payments, sortFilter);
        const ordersByDate = sortOrdersRents(orders.allOrders, sortFilter);
        const rentsByDate = sortOrdersRents(rents.allRents, sortFilter);

        setOrdersByDate(ordersByDate);
        setRevenueByDate(revenueByDate);
        setRentsByDate(rentsByDate);
        setUsersByDate(rentsByDate);

        setStats((prev) => {
          const updatedStats = prev.map((stat) => {
            if (stat.id === 1) {
              return {...stat, value: rents.activeRents.length.toString()};
            }
            if (stat.id === 2) {
              return {...stat, value: orders.activeOrders.length.toString()};
            }
            if (stat.id === 3) {
              const totalRevenue = payments.reduce(
                (
                  sum: number,
                  payment: {
                    totalAmount: string;
                    status: string;
                    createdAt: string;
                  },
                ) =>
                  payment.status === "paid" &&
                  new Date(payment.createdAt).getMonth() ===
                    new Date().getMonth()
                    ? sum + Number(payment.totalAmount)
                    : sum,
                0,
              );
              return {...stat, value: `₱${totalRevenue.toLocaleString()}`};
            }
            if (stat.id === 4) {
              return {...stat, value: users.count.toString()};
            }
            return stat;
          });
          return updatedStats;
        });
      } catch (error) {
        console.log(error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <LayoutDashboard className="size-4.5 text-primary" />
        </div>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Overview of rentals, orders, and payments.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold">{stat.value}</p>
              </div>
              <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="size-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="space-y-4">
        {/* Filter pills — scoped above the charts they control */}
        <div className="flex items-center justify-end gap-2">
          {(["Day", "Month", "Year"] as const).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={sortFilter === status ? "secondary" : "outline"}
              onClick={() => setSortFilter(status)}
            >
              {status}
            </Button>
          ))}
        </div>

        {/* Row 1: Revenue (wide) + Payment Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Revenue Chart — spans 3 cols */}
          <div className="lg:col-span-3 bg-card border border-border/40 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-base font-semibold text-foreground">
                  {chartTitle}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Overview of revenue over selected period
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold">
                  ₱{totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="h-64">
              <RevenueChart
                dateLabels={dateLabels}
                chartTitle={chartTitle}
                revenueByDate={revenueByDate}
              />
            </div>
          </div>

          {/* Payment Pie — spans 1 col */}
          <div className="lg:col-span-1 bg-card border border-border/40 rounded-2xl p-5 flex flex-col">
            <div className="mb-3">
              <p className="text-sm font-semibold text-foreground">Payments</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Status distribution
              </p>
            </div>
            <div className="flex-1 min-h-0">
              <PaymentStatusPieChart payments={payments} />
            </div>
          </div>
        </div>

        {/* Row 2: Users Over Time — full width */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-card border border-border/40 rounded-2xl p-5 flex flex-col">
            <div className="mb-3">
              <p className="text-sm font-semibold text-foreground">Users</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                New users over time
              </p>
            </div>
            <div className="flex-1 min-h-0">
              <UsersOvertimeChart
                dateLabels={dateLabels}
                usersByDate={usersByDate}
              />
            </div>
          </div>
        </div>

        {/* Row 3: Orders & Rents + Rental Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Orders & Rents Chart — spans 2 cols */}
          <div className="lg:col-span-2 bg-card border border-border/40 rounded-2xl p-6">
            <div className="mb-4">
              <p className="text-base font-semibold text-foreground">
                Orders & Rents
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Activity over time
              </p>
            </div>
            <div className="h-64">
              <Orders_RentsChart
                dateLabels={dateLabels}
                ordersByDate={ordersByDate}
                rentsByDate={rentsByDate}
              />
            </div>
          </div>

          {/* Rental Bar Chart — spans 2 cols */}
          <div className="lg:col-span-2 bg-card border border-border/40 rounded-2xl p-5 flex flex-col">
            <div className="mb-3">
              <p className="text-sm font-semibold text-foreground">
                Most Rented and Bought Outfits
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">All Time</p>
            </div>
            <div className="flex-1 min-h-0">
              <RentalBarChart />
            </div>
          </div>
        </div>

        {/* Row 4: Inventory Snapshot — full width */}
        <div className="bg-card border border-border/40 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shirt className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Inventory snapshot
            </h2>
          </div>
          {outfitStats && (
            <div className="grid gap-3 sm:grid-cols-3">
              <Snapshot
                label="Available outfits"
                value={outfitStats.totalOutfits.toString()}
              />
              <Snapshot
                label="Currently rented"
                value={outfitStats.rentedOutfits.toString()}
              />
              <Snapshot
                label="Low Stocks"
                value={outfitStats.lowStockOutfits[0].count.toString()}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Snapshot({label, value}: {label: string; value: string}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
