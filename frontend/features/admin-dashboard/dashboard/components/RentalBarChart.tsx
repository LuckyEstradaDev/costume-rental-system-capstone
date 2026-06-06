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
        label: "Rentals",
        data: Object.values(sortMostOrderedOutfits(rentalData)),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
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
            label: "Rentals",
            data: Object.values(sortMostOrderedOutfits(rentalData)),
            backgroundColor: "rgba(53, 162, 235, 0.5)",
          },
        ],
      });
    } else {
      setData({
        labels: Object.keys(sortMostOrderedOutfits(orderData)),
        datasets: [
          {
            label: "Orders",
            data: Object.values(sortMostOrderedOutfits(orderData)),
            backgroundColor: "rgba(255, 99, 132, 0.5)",
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
      } catch (error) {
        console.error("Error fetching rents:", error);
      }
    };

    fetchRents();
  }, []);

  return (
    <div className="w-full h-96">
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
      <Bar options={{responsive: true}} data={data} />;
    </div>
  );
}
