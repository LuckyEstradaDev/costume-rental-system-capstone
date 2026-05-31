"use client";

import {
  CalendarClock,
  PackageCheck,
  ReceiptText,
  Shirt,
  TrendingUp,
  Users,
  LayoutDashboard,
} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Card} from "@/components/ui/card";
import {formatStatusLabel} from "@/lib/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {useEffect, useState} from "react";
import {
  getAllActiveRentsService,
  getAllOrdersService,
  getAllPaymentsService,
  getUserCountService,
} from "@/features/admin-dashboard/dashboard/services/services";

const recentActivity = [
  {
    customer: "Maria Santos",
    action: "Placed a rental",
    item: "Emerald Ball Gown",
    status: "pending",
  },
  {
    customer: "John Cruz",
    action: "Completed payment",
    item: "Classic Black Suit",
    status: "paid",
  },
  {
    customer: "Ana Reyes",
    action: "Returned rental",
    item: "Victorian Costume",
    status: "returned",
  },
  {
    customer: "Paolo Dela Cruz",
    action: "Bought outfit",
    item: "Barong Tagalog",
    status: "received",
  },
];

export default function AdminDashboardPage() {
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
    const fetchStats = async () => {
      try {
        const rents = await getAllActiveRentsService();
        const orders = await getAllOrdersService();
        const users = await getUserCountService();
        const payments = await getAllPaymentsService();

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
                (sum: number, payment: {totalAmount: string}) =>
                  sum + Number(payment.totalAmount),
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

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-0">
          <div className="px-4 pt-4">
            <h2 className="font-semibold">Recent activity</h2>
            <p className="text-sm text-muted-foreground">
              Latest customer transactions and rental movements.
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map((activity) => (
                <TableRow key={`${activity.customer}-${activity.item}`}>
                  <TableCell className="font-medium">
                    {activity.customer}
                  </TableCell>
                  <TableCell>{activity.action}</TableCell>
                  <TableCell>{activity.item}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {formatStatusLabel(activity.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            <h2 className="font-semibold">Today&apos;s focus</h2>
          </div>
          <div className="mt-4 space-y-4">
            <FocusItem label="Prepare pickups" value="7 costumes" />
            <FocusItem label="Check returns" value="5 rentals" />
            <FocusItem label="Low stock review" value="9 variants" />
            <FocusItem label="Cleaning queue" value="14 items" />
          </div>
        </Card>
      </div>

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

function FocusItem({label, value}: {label: string; value: string}) {
  return (
    <div className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
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
