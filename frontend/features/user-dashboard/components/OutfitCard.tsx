import Image from "next/image";
import Link from "next/link";
import {ShoppingCart, Star} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Card} from "@/components/ui/card";
import {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";

export function OutfitCard({outfit}: {outfit: IOutfit}) {
  const variants = outfit.variants ?? [];

  const totalStock = variants.reduce((sum, variant) => {
    const stock = Number(variant.stock);
    return sum + (Number.isFinite(stock) ? stock : 0);
  }, 0);

  const imageSrc =
    typeof outfit.imageURL === "string"
      ? outfit.imageURL
      : "/assets/images/landing-page/suit.jpg";
  const outfitSlug = buildOutfitSlug(outfit.name, outfit._id);
  const detailHref = outfitSlug ? `/dashboard/browse/${outfitSlug}` : undefined;

  return (
    <Card className="group cursor-pointer overflow-hidden border border-border/60 bg-background transition-all hover:-translate-y-1 hover:shadow-lg">
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

          {totalStock <= 0 && <Badge variant="destructive">Out of stock</Badge>}
        </div>

        <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-black/70 p-2 opacity-0 backdrop-blur transition-all group-hover:translate-y-0 group-hover:opacity-100">
          <button className="flex w-full items-center justify-center gap-2 text-sm text-white">
            <ShoppingCart className="size-4" />
            Add to cart
          </button>
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

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3 fill-yellow-400 text-yellow-400" />
          <span>4.8</span>
          <span>•</span>
          <span>120 sold</span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-primary">
            ₱{outfit.price ?? "—"}
          </span>
          <span className="text-xs text-muted-foreground">/ day</span>
        </div>

        <p className="text-xs text-muted-foreground">
          {totalStock > 0 ? `${totalStock} available` : "No stock"}
        </p>
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
