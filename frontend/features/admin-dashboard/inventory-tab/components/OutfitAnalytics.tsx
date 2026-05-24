import {Card} from "@/components/ui/card";
import {Shirt, PackageCheck, TrendingUp} from "lucide-react";

const stats = [
  {
    label: "Total Outfits",
    value: 20,
    icon: Shirt,
  },
  {
    label: "Available",
    value: 14,
    icon: PackageCheck,
  },
  {
    label: "Rented Out",
    value: 6,
    icon: TrendingUp,
  },
];

export default function OutfitAnalytics() {
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
