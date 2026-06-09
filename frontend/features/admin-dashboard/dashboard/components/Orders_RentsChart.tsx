"use client";

import React, {useRef, useEffect} from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export default function OrdersAndRentsChart({
  dateLabels,
  ordersByDate,
  rentsByDate,
}: {
  dateLabels: string[];
  ordersByDate: Record<string, number>;
  rentsByDate: Record<string, number>;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);
  const primary = "#703c8e";
  const accent = "#9b6ecb";

  const data = {
    labels: dateLabels,
    datasets: [
      {
        label: "Orders",
        // eslint-disable-next-line react-hooks/purity
        data: dateLabels.map((label) => ordersByDate[label] || 0),
        borderColor: accent,
        backgroundColor: accent,
        tension: 0.36,
        pointRadius: 3,
        fill: false,
      },
      {
        label: "Rents",
        // eslint-disable-next-line react-hooks/purity
        data: dateLabels.map((label) => rentsByDate[label] || 0),
        borderColor: primary,
        backgroundColor: primary,
        tension: 0.36,
        pointRadius: 3,
        fill: false,
      },
    ],
  };

  useEffect(() => {
    // subtle shadow on the rents line by duplicating a faint stroke (best-effort)
    const chart = chartRef.current;
    if (!chart) return;
    try {
      chart.update();
    } catch (e) {
      // ignore
    }
  }, [dateLabels, ordersByDate, rentsByDate]);
  return (
    <div className="w-full">
      <Line
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top" as const,
              labels: {usePointStyle: true, pointStyle: "circle"},
            },
          },
          scales: {
            x: {grid: {display: false}, ticks: {color: "#6b6b6b"}},
            y: {
              grid: {color: "rgba(107,107,107,0.06)"},
              ticks: {color: "#6b6b6b"},
            },
          },
        }}
        data={data}
        ref={chartRef}
      />
    </div>
  );
}
