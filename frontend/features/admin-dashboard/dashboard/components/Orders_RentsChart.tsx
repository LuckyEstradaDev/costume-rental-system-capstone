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
  const data = {
    labels: dateLabels,
    datasets: [
      {
        label: "Orders",
        // eslint-disable-next-line react-hooks/purity
        data: dateLabels.map((label) => ordersByDate[label] || 0),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Rents",
        // eslint-disable-next-line react-hooks/purity
        data: dateLabels.map((label) => rentsByDate[label] || 0),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };
  return (
    <div className="w-full">
      <Line
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "top" as const,
            },
            title: {
              display: true,
              text: "Total Order and Rent Placements",
            },
          },
        }}
        data={data}
      ></Line>
    </div>
  );
}
