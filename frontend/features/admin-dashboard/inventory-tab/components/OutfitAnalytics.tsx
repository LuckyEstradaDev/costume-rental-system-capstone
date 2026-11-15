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
      context: "In your catalog",
      icon: <TShirt />,
    },
    {
      label: "Low Stocks",
      value: Number(data?.lowStockOutfits?.[0]?.count) || 0,
      context: "Running low on stock",
      icon: <Warning />,
    },
    {
      label: "Rented Outfits",
      value: Number(data?.rentedOutfits) || 0,
      context: "Currently out on rent",
      icon: <CalendarCheck />,
    },
  ];

  return (
    <div className="grid min-w-0 w-full grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4">
      {stats.map(({label, value, context, icon}, index) => (
        <StatCard
          key={label}
          label={label}
          value={isError ? "-" : value}
          context={context}
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