"use client";

import type {ReactNode} from "react";
import {ReceiptText, SlidersHorizontal, WalletCards} from "lucide-react";
import {Bank, Hourglass} from "@/components/ui/stat-icons";
import {StatusBadge} from "@/components/ui/status-badge";
import {Button} from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {EmptyState} from "@/components/ui/empty-state";
import {AdminPageHeader, AdminPageTitle} from "@/features/admin-dashboard/components/AdminPageHeader";
import {AdminSearchInput} from "@/features/admin-dashboard/components/AdminSearchInput";
import {AdminSegmented} from "@/features/admin-dashboard/components/AdminSegmented";
import {DateRangeSlicer} from "@/features/admin-dashboard/dashboard/components/slicers/DateRangeSlicer";
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

function formatPaymentMethod(method?: string | null) {
  switch (method?.trim().toLowerCase()) {
    case "qrph":
    case "qr ph":
      return "QRPH";
    case "gcash":
      return "Gcash";
    case "paymaya":
    case "maya":
      return "Maya";
    case "card":
      return "Card";
    case "cash":
      return "Cash";
    default:
      return method ?? "Unknown";
  }
}

function SectionHeading({children}: {children: ReactNode}) {
  return (
    <h2 className="text-xl font-semibold text-primary md:text-2xl">
      {children}
    </h2>
  );
}

export default function PaymentsPage() {
  const {data: payments = [], isLoading} = useQuery({
    queryKey: ["payments"],
    queryFn: fetchPaymentsService,
  });
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const dateWindow = useDateWindow();

  // Only the local filters. The date window lives in a shared context and is
  // driven by the floating slicer
  // rather than pretending a "clear filters" button can reset it.
  const hasActiveFilters = search.trim() !== "" || statusFilter !== "all";
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

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
      context: "Paid and settled today",
      icon: <Bank />,
    },
    {
      label: "Pending payments",
      value: formatCurrency(pendingTotal),
      context: "Still awaiting payment",
      icon: <Hourglass />,
    },
  ];

  return (
    <div className="-m-6 min-h-[calc(100vh-4.5rem)] space-y-6 bg-muted p-6">
      <AdminPageHeader
        title={<AdminPageTitle icon={WalletCards}>Payments</AdminPageTitle>}
        description="Collections, pending payouts, and refunds."
      />
      <DateRangeSlicer
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

      <section className="space-y-4">
        <SectionHeading>Overview</SectionHeading>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-2">
          {summaries.map((summary) => (
            <StatCard
              key={summary.label}
              label={summary.label}
              value={summary.value}
              context={summary.context}
              icon={summary.icon}
              isLoading={isLoading}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <SectionHeading>Payment records</SectionHeading>
            <span className="whitespace-nowrap text-sm text-muted-foreground">
              {filteredPayments.length} {filteredPayments.length === 1 ? "record" : "records"}
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <AdminSearchInput
              value={search}
              onValueChange={setSearch}
              placeholder="Search"
              wrapperClassName="w-full sm:w-64"
              className="h-9"
            />
            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 bg-background hover:border-secondary hover:bg-secondary hover:text-secondary-foreground"
                >
                  <SlidersHorizontal className="size-4" />
                  Filters
                  {statusFilter !== "all" ? (
                    <span className="size-1.5 rounded-full bg-accent" />
                  ) : null}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 space-y-3 p-3">
                <p className="text-sm font-semibold text-secondary">
                  Status
                </p>
                <AdminSegmented
                  size="sm"
                  variant="pills"
                  aria-label="Payment status"
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  options={PAYMENT_STATUS_OPTIONS}
                  className="flex-wrap [&>button]:min-w-24"
                />
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

        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground">
            Loading payments...
          </div>
        ) : filteredPayments.length === 0 ? (
          <EmptyState icon={ReceiptText} title={
              payments.length === 0
                ? "No payments yet"
                : "No payments match these filters"
            } />
        ) : (
          <Table gridlines>
            <TableHeader className="[&_tr]:border-0">
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead>Reference</TableHead>
                <TableHead>Paid by</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr]:border-0">
              {filteredPayments.map((payment) => (
                <TableRow
                  key={payment._id}
                  className="border-0 text-secondary transition-colors hover:bg-muted/40"
                >
                  <TableCell className="font-medium whitespace-nowrap text-secondary">
                    {payment.referenceID}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {payerName(payment.user) || (
                      <span className="italic text-muted-foreground">
                        Unlinked
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{formatPaymentMethod(payment.method)}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatReadableDate(
                      payment.paidAt || payment.createdAt,
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium text-secondary">
                    {formatCurrency(
                      payment.totalAmount ?? payment.cash ?? 0,
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
