import {Button} from "@/components/ui/button";
import React from "react";
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

import {MONTH_LABELS} from "@/features/admin-dashboard/dashboard/data/chartlabels";

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
  sortFilter,
  setSortFilter,
}: {
  dateLabels: string[];
  chartTitle: string;
  revenueByDate: Record<string, number>;
  sortFilter: "Day" | "Month" | "Year";
  setSortFilter: (filter: "Day" | "Month" | "Year") => void;
}) {
  const data = {
    labels: dateLabels,
    datasets: [
      {
        label: chartTitle,
        // eslint-disable-next-line react-hooks/purity
        data: dateLabels.map((label) => revenueByDate[label] || 0),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };
  return (
    <div>
      {/* filter buttons by day week month year */}
      {(["Day", "Month", "Year"] as const).map((status) => (
        <Button
          key={status}
          size="sm"
          variant={sortFilter === status ? "secondary" : "outline"}
          onClick={() => setSortFilter(status)}
        >
          {status === "Day" ? "Day" : status}
        </Button>
      ))}
      <Line
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "top" as const,
            },
            title: {
              display: true,
              text: "Total Revenue",
            },
          },
        }}
        data={data}
      ></Line>
    </div>
  );
}
