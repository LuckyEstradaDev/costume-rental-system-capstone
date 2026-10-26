import Image from "next/image";
import Link from "next/link";
import {CalendarClock, CreditCard} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Card} from "@/components/ui/card";
import {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {buildOutfitPath} from "@/lib/reference-path";

export function OutfitCard({outfit}: {outfit: IOutfit}) {
  const getStock = () => {
    return (outfit.variants ?? [])
      .map((variant) =>
        (variant.sizes ?? []).reduce((acc, size) => acc + (size.stock ?? 0), 0),
      )
      .reduce((acc, stock) => acc + stock, 0);
  };

  const imageSrc =
    typeof outfit.imageURL === "string"
      ? outfit.imageURL
      : "/assets/images/landing-page/suit.jpg";
  const detailHref =
    buildOutfitPath(outfit.referenceID) ||
    buildOutfitPath(outfit._id) ||
    undefined;

  return (
    <Card className="group relative cursor-pointer overflow-hidden border border-border/60 bg-background py-0 transition-all hover:-translate-y-1 hover:shadow-lg">
      {detailHref && (
        <Link
          href={detailHref}
          aria-label={`View ${outfit.name}`}
          className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      )}

      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={imageSrc}
          alt={outfit.name || "Outfit"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <Badge className="bg-black/70 text-white backdrop-blur">
            {outfit.category}
          </Badge>

          {getStock() <= 0 && <Badge variant="destructive">Out of stock</Badge>}
        </div>
      </div>

      <div className="space-y-1 p-3">
        <p className="line-clamp-2 text-sm font-medium leading-tight">
          {outfit.name}
        </p>

        <div className="grid gap-2 pt-1">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {outfit.price && (
              <div className="flex items-center gap-1">
                <CreditCard
                  className="h-4 w-4 text-primary"
                  aria-label="Purchase price"
                />
                <span className="font-semibold text-primary">
                  ₱{outfit.price?.toLocaleString()}
                </span>
              </div>
            )}

            {outfit.rentalPrice && (
              <div className="flex items-center gap-1">
                <CalendarClock
                  className="h-4 w-4 text-primary"
                  aria-label="Rent price"
                />
                <span className="font-semibold text-primary">
                  ₱{outfit.rentalPrice?.toLocaleString()}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {getStock() > 0 ? `${getStock()} available` : "No stock"}
          </p>
        </div>
      </div>
    </Card>
  );
}
