"use client";

import {useMemo} from "react";
import {Chart as ChartJS, ArcElement, Tooltip, Legend} from "chart.js";
import {Pie} from "react-chartjs-2";
import {formatStatusLabel} from "@/lib/formatters";
import type {PaymentItem} from "../services/services";
import {
  FALLBACK_SERIES_COLORS,
  PAYMENT_STATUS_COLORS,
  SLICE_BORDER_COLOR,
} from "../utils/chartPalette";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PaymentStatusPieChart({
  payments,
}: {
  payments: PaymentItem[];
}) {
  const data = useMemo(() => {
    const counts = payments.reduce<Record<string, number>>((acc, payment) => {
      acc[payment.status] = (acc[payment.status] ?? 0) + 1;
      return acc;
    }, {});

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    return {
      labels: entries.map(([status]) => formatStatusLabel(status)),
      datasets: [
        {
          data: entries.map(([, count]) => count),
          backgroundColor: entries.map(
            ([status], i) =>
              PAYMENT_STATUS_COLORS[status] ??
              FALLBACK_SERIES_COLORS[i % FALLBACK_SERIES_COLORS.length],
          ),
          borderColor: SLICE_BORDER_COLOR,
          borderWidth: 2,
        },
      ],
    };
  }, [payments]);

  if (payments.length === 0) {
    return (
      <div className="grid h-full min-h-40 place-items-center px-4 text-center text-sm text-muted-foreground">
        No payments in this selection.
      </div>
    );
  }

  return (
    <div className="w-full">
      <Pie
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top" as const,
              labels: {usePointStyle: true, pointStyle: "circle"},
            },
            title: {display: false},
          },
        }}
      />
    </div>
  );
}
