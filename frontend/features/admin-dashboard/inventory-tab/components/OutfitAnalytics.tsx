import {StatCard} from "@/components/ui/stat-card";
import {Shirt, PackageCheck, TrendingUp} from "lucide-react";
import {fetchOutfitStats} from "../services/outfitService";
import {useQuery} from "@tanstack/react-query";

export default function OutfitAnalytics() {
  const {data, isLoading, isError} = useQuery({
    queryKey: ["outfit-stats"],
    queryFn: fetchOutfitStats,
  });

  const stats = [
    {
      label: "Total Outfits",
      value: Number(data?.totalOutfits) || 0,
      icon: Shirt,
    },
    {
      label: "Low Stocks",
      value: Number(data?.lowStockOutfits?.[0]?.count) || 0,
      icon: PackageCheck,
    },
    {
      label: "Rented Outfits",
      value: Number(data?.rentedOutfits) || 0,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map(({label, value, icon: Icon}) => (
        <StatCard
          key={label}
          label={label}
          value={isLoading || isError ? "—" : value}
          icon={Icon}
          ariaBusy={isLoading}
        />
      ))}
    </div>
  );
}
