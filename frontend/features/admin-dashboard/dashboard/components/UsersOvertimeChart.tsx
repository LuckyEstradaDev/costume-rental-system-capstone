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

interface UsersOvertimeChartProps {
  series: SeriesPoint[];
}

export default function UsersOvertimeChart({series}: UsersOvertimeChartProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);

  const data = useMemo(
    () => ({
      labels: series.map((point) => point.label),
      datasets: [
        {
          label: "New signups",
          data: series.map((point) => point.value),
          borderColor: CHART_COLORS.signups,
          backgroundColor: CHART_COLORS.signups,
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
