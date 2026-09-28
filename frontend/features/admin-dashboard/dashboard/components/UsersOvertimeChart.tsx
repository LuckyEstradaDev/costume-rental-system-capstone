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

interface UsersOvertimeChartProps {
  series: SeriesPoint[];
}

export default function UsersOvertimeChart({series}: UsersOvertimeChartProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);
  const accent = "#3b82f6";

  const data = useMemo(
    () => ({
      labels: series.map((point) => point.label),
      datasets: [
        {
          label: "New signups",
          data: series.map((point) => point.value),
          borderColor: accent,
          backgroundColor: accent,
          borderWidth: 2,
          pointRadius: series.length > 60 ? 0 : 2,
          pointHoverRadius: 5,
          tension: 0.36,
          fill: false,
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
          plugins: {legend: {display: false}},
          scales: {
            x: {
              grid: {display: false},
              ticks: {
                color: "#6b6b6b",
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 12,
              },
            },
            y: {
              beginAtZero: true,
              min: 0,
              grid: {color: "rgba(107,107,107,0.06)"},
              ticks: {
                color: "#6b6b6b",
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
