import {Card, CardContent} from "@/components/ui/card";
import {Shirt, PackageCheck, TrendingUp} from "lucide-react";

const stats = [
  {
    label: "Total Outfits",
    value: 20,
    icon: Shirt,
    description: "Items in inventory",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    label: "Available",
    value: 14,
    icon: PackageCheck,
    description: "Ready to rent or sell",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Rented Out",
    value: 6,
    icon: TrendingUp,
    description: "Currently with customers",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
];

export default function OutfitAnalytics() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map(({label, value, icon: Icon, description, color, bg}) => (
        <Card
          key={label}
          className="border-0 shadow-sm ring-1 ring-border/60 transition-shadow hover:shadow-md"
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {label}
                </p>
                <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <div className={`rounded-xl p-2.5 ${bg}`}>
                <Icon className={`size-5 ${color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
