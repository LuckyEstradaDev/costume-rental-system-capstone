"use client";

import {ReceiptText, WalletCards} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Card} from "@/components/ui/card";
import {StatCard} from "@/components/ui/stat-card";
import {formatCurrency, formatReadableDate, formatStatusLabel} from "@/lib/formatters";
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
import {sortArrayByLatestDate} from "@/lib/helper";
import {useDateWindow} from "@/features/admin-dashboard/dashboard/hooks/useDateWindow";
import {AdminPageHeader, AdminPageTitle} from "@/features/admin-dashboard/components/AdminPageHeader";
import {AdminSearchInput} from "@/features/admin-dashboard/components/AdminSearchInput";
import {AdminSegmented} from "@/features/admin-dashboard/components/AdminSegmented";
import {DateRangeDropdown} from "@/features/admin-dashboard/dashboard/components/slicers/DateRangeDropdown";
import {isWithinRange} from "@/features/admin-dashboard/dashboard/utils/dateRange";
import {
  fetchPaymentsService,
  type PaymentPayer,
  type PaymentStatus,
} from "@/features/admin-dashboard/payments-tab/services/paymentService";

/** Matches the name composition used in the profile and sidebar. */
const payerName = (user?: PaymentPayer | null) =>
  user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : "";

const PAYMENT_STATUS_OPTIONS = [
  {value: "all", label: "All"},
  {value: "pending", label: formatStatusLabel("pending")},
  {value: "paid", label: formatStatusLabel("paid")},
  {value: "refunded", label: formatStatusLabel("refunded")},
  {value: "failed", label: formatStatusLabel("failed")},
] as const;

export default function PaymentsPage() {
  const {data: payments = [], isLoading} = useQuery({
    queryKey: ["payments"],
    queryFn: fetchPaymentsService,
  });
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const dateWindow = useDateWindow();

  const filteredPayments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return sortArrayByLatestDate(
      payments.map((payment) => ({
        ...payment,
        createdAt: payment.createdAt || payment.paidAt || null,
      })),
    )
      .filter((payment) => {
        if (!normalizedSearch) {
          return true;
        }

        return (
          payment.referenceID.toLowerCase().includes(normalizedSearch) ||
          payment.orderID?.toLowerCase().includes(normalizedSearch) ||
          payment.method?.toLowerCase().includes(normalizedSearch) ||
          payment.status.toLowerCase().includes(normalizedSearch) ||
          payerName(payment.user).toLowerCase().includes(normalizedSearch)
        );
      })
      .filter((payment) =>
        statusFilter === "all" ? true : payment.status === statusFilter,
      )
      .filter((payment) =>
        isWithinRange(payment.createdAt, dateWindow.range),
      );
  }, [payments, search, statusFilter, dateWindow.range]);

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
      <AdminPageHeader
        title={<AdminPageTitle icon={WalletCards}>Payments</AdminPageTitle>}
        actions={
          <DateRangeDropdown
            presetId={dateWindow.presetId}
            range={dateWindow.range}
            customFrom={dateWindow.customFrom}
            customTo={dateWindow.customTo}
            isDefault={dateWindow.isDefault}
            defaultPreset="all"
            onPresetChange={dateWindow.setPreset}
            onCustomFromChange={dateWindow.setCustomFromValue}
            onCustomToChange={dateWindow.setCustomToValue}
            onReset={dateWindow.resetAll}
          />
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {summaries.map((summary) => (
          <StatCard
            key={summary.label}
            label={summary.label}
            value={summary.value}
            icon={summary.icon}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-semibold">Payment records</h2>
          {filteredPayments.length !== payments.length && (
            <p className="text-sm text-muted-foreground">
              {filteredPayments.length} of {payments.length} records match the
              current filters.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <AdminSearchInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search reference, order, method…"
            wrapperClassName="sm:max-w-64"
          />
          <AdminSegmented
            aria-label="Payment status"
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={PAYMENT_STATUS_OPTIONS}
          />
        </div>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Paid by</TableHead>
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
                  colSpan={6}
                  className="p-6 text-center text-sm text-muted-foreground"
                >
                  Loading payments...
                </TableCell>
              </TableRow>
            ) : filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="p-6 text-center text-sm text-muted-foreground"
                >
                  No payment records match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell className="font-medium">
                    {payment.referenceID}
                  </TableCell>
                  <TableCell>
                    {payerName(payment.user) || (
                      <span className="italic text-muted-foreground/60">
                        Unlinked
                      </span>
                    )}
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
