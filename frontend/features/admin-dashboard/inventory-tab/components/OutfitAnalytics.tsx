import {StatCard} from "@/components/ui/stat-card";
import {
  CalendarCheck,
  TShirt,
  Warning,
} from "@/components/ui/stat-icons";
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
      icon: <TShirt />,
    },
    {
      label: "Low Stocks",
      value: Number(data?.lowStockOutfits?.[0]?.count) || 0,
      icon: <Warning />,
    },
    {
      label: "Rented Outfits",
      value: Number(data?.rentedOutfits) || 0,
      icon: <CalendarCheck />,
    },
  ];

  return (
    <div className="grid min-w-0 w-full grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4">
      {stats.map(({label, value, icon}, index) => (
        <StatCard
          key={label}
          label={label}
          value={isError ? "-" : value}
          icon={icon}
          isLoading={isLoading}
          // On the two-column mobile grid the last card takes the full row.
          className={
            stats.length === 3 && index === stats.length - 1
              ? "col-span-2 sm:col-span-1"
              : undefined
          }
        />
      ))}
    </div>
  );
}
