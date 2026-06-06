"use client";

import {sortRevenue} from "@/features/admin-dashboard/dashboard/utils/helpers";

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
import RevenueChart from "@/features/admin-dashboard/dashboard/components/RevenueChart";
import {MONTH_LABELS} from "@/features/admin-dashboard/dashboard/data/chartlabels";

export default function AdminDashboardPage() {
  const [revenueByDate, setRevenueByDate] = useState<Record<string, number>>(
    {},
  );
  const [payments, setPayments] = useState<
    {createdAt: string; totalAmount: string; status: string}[]
  >([]);
  const [sortFilter, setSortFilter] = useState<"Day" | "Month" | "Year">("Day");
  const [dateLabels, setDateLabels] = useState<string[]>([]);
  const [chartTitle, setChartTitle] = useState<string>("Daily Revenue");

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRevenueByDate(revenueByDate);
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
        setPayments(payments);
        const revenueByDate = sortRevenue(payments, sortFilter);

        setRevenueByDate(revenueByDate);

        setStats((prev) => {
          const updatedStats = prev.map((stat) => {
            if (stat.id === 1) {
              return {...stat, value: rents.toString()};
            }
            if (stat.id === 2) {
              return {...stat, value: orders.toString()};
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
              return {...stat, value: users.toString()};
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <LayoutDashboard className="size-4.5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Overview of rentals, orders, payments, and customer activity.
            </p>
          </div>
        </div>
      </div>

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

      <RevenueChart
        dateLabels={dateLabels}
        chartTitle={chartTitle}
        revenueByDate={revenueByDate}
        sortFilter={sortFilter}
        setSortFilter={setSortFilter}
      />

      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Shirt className="size-4 text-primary" />
          <h2 className="font-semibold">Inventory snapshot</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Snapshot label="Available outfits" value="132" />
          <Snapshot label="Currently rented" value="38" />
          <Snapshot label="Needs maintenance" value="11" />
        </div>
      </Card>
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
