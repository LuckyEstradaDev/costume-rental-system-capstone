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
} from "chart.js";
import {useEffect, useState} from "react";
import {
  getAllActiveRentsService,
  getAllOrdersService,
} from "../services/services";
import {sortMostOrderedOutfits} from "@/features/admin-dashboard/dashboard/utils/helpers";
import {Button} from "@/components/ui/button";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function RentalBarChart() {
  const [rentalData, setRentalData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [sortFilter, setSortFilter] = useState<"Rent" | "Order">("Rent");
  const [data, setData] = useState({
    labels: Object.keys(sortMostOrderedOutfits(rentalData)),
    datasets: [
      {
        label: "Most Rented Outfits",
        data: Object.values(sortMostOrderedOutfits(rentalData)),
        backgroundColor: "rgba(112,60,142,0.9)",
        borderRadius: 6,
      },
    ],
  });

  useEffect(() => {
    if (sortFilter === "Rent") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData({
        labels: Object.keys(sortMostOrderedOutfits(rentalData)),
        datasets: [
          {
            label: "Most Rented Outfits",
            data: Object.values(sortMostOrderedOutfits(rentalData)),
            backgroundColor: "rgba(112,60,142,0.9)",
            borderRadius: 6,
          },
        ],
      });
    } else {
      setData({
        labels: Object.keys(sortMostOrderedOutfits(orderData)),
        datasets: [
          {
            label: "Most Bought Outfits",
            data: Object.values(sortMostOrderedOutfits(orderData)),
            backgroundColor: "rgba(155,110,203,0.9)",
            borderRadius: 6,
          },
        ],
      });
    }
  }, [sortFilter]);

  useEffect(() => {
    const fetchRents = async () => {
      try {
        const rents = await getAllActiveRentsService();
        setRentalData(rents.completedRents);
        const orders = await getAllOrdersService();
        setOrderData(orders.activeOrders);

        setData({
          labels: Object.keys(sortMostOrderedOutfits(rents.completedRents)),
          datasets: [
            {
              label: "Most Bought Outfits",
              data: Object.values(sortMostOrderedOutfits(rents.completedRents)),
              backgroundColor: "rgba(155,110,203,0.9)",
              borderRadius: 6,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching rents:", error);
      }
    };

    fetchRents();
  }, []);

  return (
    <div className="w-full">
      <div className="flex gap-2">
        {(["Rent", "Order"] as const).map((item) => (
          <Button
            key={item}
            size="sm"
            variant={sortFilter === item ? "secondary" : "outline"}
            onClick={() => setSortFilter(item)}
          >
            {item}
          </Button>
        ))}
      </div>
      <div className="mt-3">
        <Bar
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {grid: {display: false}, ticks: {color: "#6b6b6b"}},
              y: {
                grid: {color: "rgba(107,107,107,0.06)"},
                ticks: {color: "#6b6b6b"},
              },
            },
            plugins: {legend: {display: false}},
          }}
          data={data}
        />
      </div>
    </div>
  );
}
