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
import {AXIS_TICK_COLOR, CHART_COLORS, GRID_COLOR} from "../utils/chartPalette";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface OrdersRentsChartProps {
  orders: SeriesPoint[];
  rents: SeriesPoint[];
}

export default function OrdersAndRentsChart({
  orders,
  rents,
}: OrdersRentsChartProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);

  const data = useMemo(
    () => ({
      // Both series are built from the same dense bucket sequence upstream, so
      // they always share one x-axis without any label reconciliation here.
      labels: orders.map((point) => point.label),
      datasets: [
        {
          label: "Orders",
          data: orders.map((point) => point.value),
          borderColor: CHART_COLORS.orders,
          backgroundColor: CHART_COLORS.orders,
          tension: 0.36,
          pointRadius: orders.length > 60 ? 0 : 3,
          pointHoverRadius: 6,
          fill: false,
        },
        {
          label: "Rentals",
          data: rents.map((point) => point.value),
          borderColor: CHART_COLORS.rentals,
          backgroundColor: CHART_COLORS.rentals,
          tension: 0.36,
          pointRadius: rents.length > 60 ? 0 : 3,
          pointHoverRadius: 6,
          fill: false,
        },
      ],
    }),
    [orders, rents],
  );

  return (
    <div className="w-full">
      <Line
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: {mode: "index", intersect: false},
          plugins: {
            legend: {
              position: "top" as const,
              labels: {usePointStyle: true, pointStyle: "circle"},
            },
          },
          scales: {
            x: {
              grid: {display: false},
              ticks: {
                color: AXIS_TICK_COLOR,
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 12,
              },
            },
            y: {
              beginAtZero: true,
              min: 0,
              grid: {color: GRID_COLOR},
              ticks: {
                color: AXIS_TICK_COLOR,
                precision: 0,
                stepSize: 1,
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
