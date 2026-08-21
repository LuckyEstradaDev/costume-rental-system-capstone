"use client";

import {ReceiptText, Search, WalletCards} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {formatCurrency, formatReadableDate} from "@/lib/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {useMemo, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {
  fetchPaymentsService,
  type PaymentStatus,
} from "@/features/admin-dashboard/payments-tab/services/paymentService";

export default function PaymentsPage() {
  const {data: payments = [], isLoading} = useQuery({
    queryKey: ["payments"],
    queryFn: fetchPaymentsService,
  });
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");

  const filteredPayments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return payments
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.paidAt || "").getTime();
        const dateB = new Date(b.createdAt || b.paidAt || "").getTime();
        return dateB - dateA;
      })
      .filter((payment) => {
        if (!normalizedSearch) {
          return true;
        }

        return (
          payment.referenceID.toLowerCase().includes(normalizedSearch) ||
          payment.orderID?.toLowerCase().includes(normalizedSearch) ||
          payment.method?.toLowerCase().includes(normalizedSearch) ||
          payment.status.toLowerCase().includes(normalizedSearch)
        );
      })
      .filter((payment) =>
        statusFilter === "all" ? true : payment.status === statusFilter,
      );
  }, [payments, search, statusFilter]);

  const collectedToday = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => {
      if (!payment.paidAt) {
        return sum;
      }

      const paidAt = new Date(payment.paidAt);
      const today = new Date();

      if (
        paidAt.getFullYear() === today.getFullYear() &&
        paidAt.getMonth() === today.getMonth() &&
        paidAt.getDate() === today.getDate()
      ) {
        return sum + (payment.totalAmount ?? payment.cash ?? 0);
      }

      return sum;
    }, 0);

  const pendingTotal = payments
    .filter((payment) => payment.status === "pending")
    .reduce(
      (sum, payment) => sum + (payment.totalAmount ?? payment.cash ?? 0),
      0,
    );

  const summaries = [
    {
      label: "Collected today",
      value: formatCurrency(collectedToday),
      icon: WalletCards,
    },
    {
      label: "Pending payments",
      value: formatCurrency(pendingTotal),
      icon: ReceiptText,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <WalletCards className="size-4.5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Payments
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor payment records and settle pending orders in real time.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {summaries.map((summary) => (
          <Card key={summary.label} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{summary.label}</p>
                <p className="mt-2 text-2xl font-bold">{summary.value}</p>
              </div>
              <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <summary.icon className="size-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Payment records</h2>
            <p className="text-sm text-muted-foreground">
              Live admin payment history pulled from the backend.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-8"
                placeholder="Search reference, order, method..."
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "pending", "paid", "refunded", "failed"] as const).map(
                (status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={statusFilter === status ? "secondary" : "outline"}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === "all" ? "All" : status}
                  </Button>
                ),
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="p-6 text-center text-sm text-muted-foreground"
                >
                  Loading payments...
                </TableCell>
              </TableRow>
            ) : filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="p-6 text-center text-sm text-muted-foreground"
                >
                  No payment records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell className="font-medium">
                    {payment.referenceID}
                  </TableCell>
                  <TableCell>{payment.method ?? "Unknown"}</TableCell>
                  <TableCell>
                    {formatReadableDate(payment.paidAt || payment.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === "paid"
                          ? "secondary"
                          : payment.status === "refunded"
                            ? "outline"
                            : payment.status === "failed"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(payment.totalAmount ?? payment.cash ?? 0)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
