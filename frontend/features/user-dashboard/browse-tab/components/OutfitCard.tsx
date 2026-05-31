import Image from "next/image";
import Link from "next/link";
import {CalendarClock, CreditCard, Star} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Card} from "@/components/ui/card";
import {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";

export function OutfitCard({outfit}: {outfit: IOutfit}) {
  const getStock = () => {
    return outfit.variants
      .map((variant) =>
        variant.sizes.reduce((acc, size) => acc + size.stock, 0),
      )
      .reduce((acc, stock) => acc + stock, 0);
  };

  const imageSrc =
    typeof outfit.imageURL === "string"
      ? outfit.imageURL
      : "/assets/images/landing-page/suit.jpg";
  const outfitSlug = buildOutfitSlug(outfit.name, outfit._id);
  const detailHref = outfitSlug ? `/dashboard/browse/${outfitSlug}` : undefined;

  return (
    <Card className="group py-0 cursor-pointer overflow-hidden border border-border/60 bg-background transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {detailHref ? (
          <Link href={detailHref} className="block h-full w-full">
            <Image
              src={imageSrc}
              alt={outfit.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        ) : (
          <Image
            src={imageSrc}
            alt={outfit.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <Badge className="bg-black/70 text-white backdrop-blur">
            {outfit.category}
          </Badge>

          {getStock() <= 0 && <Badge variant="destructive">Out of stock</Badge>}
        </div>
      </div>

      <div className="space-y-1 p-3">
        {detailHref ? (
          <Link
            href={detailHref}
            className="line-clamp-2 text-sm font-medium leading-tight hover:underline"
          >
            {outfit.name}
          </Link>
        ) : (
          <p className="line-clamp-2 text-sm font-medium leading-tight">
            {outfit.name}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span>4.8</span>
          <span>•</span>
          <span>120 sold</span>
        </div>

        <div className="grid gap-2 pt-1">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarClock
                className="h-4 w-4 text-primary"
                aria-label="Rent price"
              />
              <span className="font-semibold text-primary">
                ₱{outfit.rentalPrice ?? "—"}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <CreditCard
                className="h-4 w-4 text-primary"
                aria-label="Purchase price"
              />
              <span className="font-semibold text-primary">
                ₱{outfit.price ?? "—"}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {getStock() > 0 ? `${getStock()} available` : "No stock"}
          </p>
        </div>
      </div>
    </Card>
  );
}

function buildOutfitSlug(name: string, outfitId?: string) {
  if (!outfitId) {
    return "";
  }

  const normalizedName = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${normalizedName}-${outfitId}`;
}
