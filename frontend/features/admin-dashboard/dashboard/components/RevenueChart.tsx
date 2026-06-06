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

export default function RevenueChart({
  dateLabels,
  chartTitle,
  revenueByDate,
}: {
  dateLabels: string[];
  chartTitle: string;
  revenueByDate: Record<string, number>;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);

  const primary = "#703c8e";

  const data = {
    labels: dateLabels,
    datasets: [
      {
        label: chartTitle,
        // eslint-disable-next-line react-hooks/purity
        data: dateLabels.map((label) => revenueByDate[label] || 0),
        borderColor: primary,
        backgroundColor: primary,
        borderWidth: 2,
        pointBackgroundColor: primary,
        pointRadius: 3,
        pointHoverRadius: 6,
        tension: 0.36,
        fill: true,
      },
    ],
  };

  useEffect(() => {
    // create gradient fill that matches card aesthetic
    const chart = chartRef.current;
    if (!chart) return;
    const ctx = chart.ctx as CanvasRenderingContext2D;
    const gradient = ctx.createLinearGradient(0, 0, 0, chart.height);
    gradient.addColorStop(0, "rgba(112,60,142,0.18)");
    gradient.addColorStop(1, "rgba(112,60,142,0.03)");
    try {
      chart.data.datasets[0].backgroundColor = gradient;
      chart.update();
    } catch (e) {
      // ignore update errors during SSR or unmounted state
    }
  }, [dateLabels, revenueByDate]);

  return (
    <div className="w-full">
      <Line
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {display: false},
            tooltip: {
              callbacks: {
                label: (context) => {
                  const v = context.parsed.y || 0;
                  return `₱${Number(v).toLocaleString()}`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: {display: false},
              ticks: {font: {size: 11}, color: "#6b6b6b"},
            },
            y: {
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
