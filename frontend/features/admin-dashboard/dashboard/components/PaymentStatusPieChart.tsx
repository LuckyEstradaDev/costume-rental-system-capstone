"use client";

import {Chart as ChartJS, ArcElement, Tooltip, Legend} from "chart.js";

import {Pie} from "react-chartjs-2";
import {sortPaymentByStatus} from "../utils/helpers";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PaymentStatusPieChart({
  payments,
}: {
  payments: {status: string}[];
}) {
  const sortedPayments = sortPaymentByStatus(payments);
  const data = {
    labels: Object.keys(sortedPayments),
    datasets: [
      {
        data: Object.values(sortedPayments),
        backgroundColor: ["#703c8e", "#f59e0b", "#6366f1", "#10b981"],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="w-full">
      <Pie
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "top" as const,
              labels: {usePointStyle: true, pointStyle: "circle"},
            },
            title: {
              display: true,
              text: "Payment Status Distribution",
            },
          },
        }}
      />
    </div>
  );
}
