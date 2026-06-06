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
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
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
