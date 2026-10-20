import {StatCard} from "@/components/ui/stat-card";
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
    },
    {
      label: "Low Stocks",
      value: Number(data?.lowStockOutfits?.[0]?.count) || 0,
    },
    {
      label: "Rented Outfits",
      value: Number(data?.rentedOutfits) || 0,
    },
  ];

  return (
    <div className="grid min-w-0 w-full grid-cols-3 gap-2.5 sm:gap-4">
      {stats.map(({label, value}) => (
        <StatCard
          key={label}
          label={label}
          value={isError ? "-" : value}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
