"use client";

import {useMemo, useRef} from "react";
import {Line} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type {SeriesPoint} from "../utils/applyFilters";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface RevenueChartProps {
  series: SeriesPoint[];
  /** "gross" counts settled payments; "net" subtracts refunds. */
  mode: "gross" | "net";
}

export default function RevenueChart({series, mode}: RevenueChartProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);

  const primary = "#703c8e";
  const netColor = "#9b6ecb";

  const data = useMemo(
    () => ({
      labels: series.map((point) => point.label),
      datasets: [
        {
          label: mode === "gross" ? "Gross revenue" : "Net revenue",
          // A bucket where refunds exceed collections nets negative. The line is
          // pinned at zero so the chart never shows a dip below the axis; the
          // exact net is still reported on the revenue stat card and total.
          data: series.map((point) => Math.max(0, point.value)),
          borderColor: mode === "gross" ? primary : netColor,
          backgroundColor: mode === "gross" ? primary : netColor,
          borderWidth: 2,
          pointBackgroundColor: mode === "gross" ? primary : netColor,
          pointRadius: series.length > 60 ? 0 : 3,
          pointHoverRadius: 6,
          tension: 0.36,
          fill: true,
        },
      ],
    }),
    [series, mode],
  );

  return (
    <div className="w-full">
      <Line
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: {mode: "index", intersect: false},
          plugins: {
            legend: {display: false},
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.parsed.y ?? 0;
                  return `₱${Number(value).toLocaleString()}`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: {display: false},
              ticks: {
                font: {size: 11},
                color: "#6b6b6b",
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 12,
              },
            },
            y: {
              beginAtZero: true,
              min: 0,
              grid: {color: "rgba(107,107,107,0.08)"},
              ticks: {
                font: {size: 11},
                color: "#6b6b6b",
                callback: (tickValue: string | number) => {
                  const value =
                    typeof tickValue === "string"
                      ? Number(tickValue)
                      : tickValue;
                  if (Number(value) >= 1000)
                    return `₱${(Number(value) / 1000).toFixed(0)}k`;
                  return `₱${Number(value)}`;
                },
              },
            },
          },
        }}
        data={data}
        ref={chartRef}
      />
    </div>
  );
}
