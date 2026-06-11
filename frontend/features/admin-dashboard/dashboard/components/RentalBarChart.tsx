"use client";

import {Bar} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import {useEffect, useState} from "react";
import {
  getAllActiveRentsService,
  getAllOrdersService,
} from "../services/services";
import {sortMostOrderedOutfits} from "@/features/admin-dashboard/dashboard/utils/helpers";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: {display: false},
      ticks: {color: "#6b6b6b"},
    },
    y: {
      grid: {color: "rgba(107,107,107,0.06)"},
      ticks: {
        color: "#6b6b6b",
        stepSize: 1,
        callback: (value: string | number) =>
          Number.isInteger(Number(value)) ? value : "",
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
};

function buildBarData(
  label: string,
  items: Array<{items: {name: string; quantity: number}[]}>,
  backgroundColor: string,
): ChartData<"bar"> {
  const counts = sortMostOrderedOutfits(items);

  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label,
        data: Object.values(counts),
        backgroundColor,
        borderRadius: 6,
      },
    ],
  };
}

export function MostRentedOutfitChart() {
  const [data, setData] = useState<ChartData<"bar">>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    void (async () => {
      try {
        const rents = await getAllActiveRentsService();

        setData(
          buildBarData(
            "Most Rented Outfits",
            rents.completedRents,
            "rgba(112,60,142,0.9)",
          ),
        );
      } catch (error) {
        console.error("Error fetching rented outfits:", error);
      }
    })();
  }, []);

  return <Bar options={barChartOptions} data={data} />;
}

export function MostBoughtOutfitChart() {
  const [data, setData] = useState<ChartData<"bar">>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    void (async () => {
      try {
        const orders = await getAllOrdersService();

        setData(
          buildBarData(
            "Most Bought Outfits",
            orders.allOrders,
            "rgba(155,110,203,0.9)",
          ),
        );
      } catch (error) {
        console.error("Error fetching bought outfits:", error);
      }
    })();
  }, []);

  return <Bar options={barChartOptions} data={data} />;
}
