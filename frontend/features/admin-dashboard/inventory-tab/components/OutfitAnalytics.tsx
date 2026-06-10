import {Card} from "@/components/ui/card";
import {Shirt, PackageCheck, TrendingUp} from "lucide-react";
import {useEffect, useState} from "react";
import {fetchOutfitStats} from "../services/outfitService";

export default function OutfitAnalytics() {
  const [stats, setStats] = useState([
    {
      label: "Total Outfits",
      value: 0,
      icon: Shirt,
    },
    {
      label: "Low Stocks",
      value: 0,
      icon: PackageCheck,
    },
    {
      label: "Rented Out",
      value: 0,
      icon: TrendingUp,
    },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const {data} = await fetchOutfitStats();
        setStats([
          {
            label: "Total Outfits",
            value: data.totalOutfits,
            icon: Shirt,
          },
          {
            label: "Low Stocks",
            value: data.lowStockOutfits[0]?.count || 0,
            icon: PackageCheck,
          },
          {
            label: "Rented Outfits",
            value: data.rentedOutfits,
            icon: TrendingUp,
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch outfit stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map(({label, value, icon: Icon}) => (
        <Card key={label} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </div>
            <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
