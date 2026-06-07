"use client";

import React, {useEffect, useRef} from "react";
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

export default function UsersOvertimeChart({
  dateLabels,
  usersByDate,
}: {
  dateLabels: string[];
  usersByDate: Record<string, number>;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);
  const accent = "#3b82f6";

  const data = {
    labels: dateLabels,
    datasets: [
      {
        label: "New Users",
        data: dateLabels.map((label) => usersByDate[label] || 0),
        borderColor: accent,
        backgroundColor: accent,
        borderWidth: 2,
        pointRadius: 2,
        tension: 0.36,
        fill: false,
      },
    ],
  };

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    try {
      chart.update();
    } catch (e) {
      // ignore
    }
  }, [dateLabels, usersByDate]);

  return (
    <div className="w-full">
      <Line
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {legend: {display: false}},
          scales: {
            x: {grid: {display: false}, ticks: {color: "#6b6b6b"}},
            y: {
              beginAtZero: true,
              min: 0,
              grid: {color: "rgba(107,107,107,0.06)"},
              ticks: {
                color: "#6b6b6b",
                stepSize: 1,
                callback: (value) => {
                  // Only show whole numbers
                  return Number.isInteger(value) ? value : "";
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
