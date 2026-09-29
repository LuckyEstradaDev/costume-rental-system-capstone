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

interface RevenueChartProps {
  series: SeriesPoint[];
}

export default function RevenueChart({series}: RevenueChartProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);

  const data = useMemo(
    () => ({
      labels: series.map((point) => point.label),
      datasets: [
        {
          label: "Net revenue",
          // A bucket where refunds exceed collections nets negative. The line is
          // pinned at zero so the chart never shows a dip below the axis; the
          // exact net is still reported on the revenue stat card and total.
          data: series.map((point) => Math.max(0, point.value)),
          borderColor: CHART_COLORS.revenue,
          backgroundColor: CHART_COLORS.revenue,
          borderWidth: 2,
          pointBackgroundColor: CHART_COLORS.revenue,
          pointRadius: series.length > 60 ? 0 : 3,
          pointHoverRadius: 6,
          tension: 0.36,
          fill: true,
        },
      ],
    }),
    [series],
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
                font: {size: 11},
                color: AXIS_TICK_COLOR,
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
