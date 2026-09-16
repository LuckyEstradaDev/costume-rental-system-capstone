"use client";

/* eslint-disable @next/next/no-img-element */

import {CheckCircle, Package, Shirt} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";
import {usePackage} from "../hooks/usePackage";

const FALLBACK_IMAGE = "/assets/images/landing-page/suit.jpg";

function totalStock(outfit: {variants: {sizes: {stock: number}[]}[]}): number {
  return outfit.variants.reduce(
    (total, variant) =>
      total + variant.sizes.reduce((sum, size) => sum + size.stock, 0),
    0,
  );
}

export function OutfitPickerStep() {
  const {outfits, selectOutfit, isOutfitComplete, getOutfitCurrentQty, getMinQuantity} =
    usePackage();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">Select an Outfit</h3>
        <p className="text-sm text-muted-foreground">
          Choose an outfit from this package to configure.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {outfits.map((outfit) => {
          const outfitId = outfit._id!;
          const complete = isOutfitComplete(outfitId);
          const current = getOutfitCurrentQty(outfitId);
          const min = getMinQuantity(outfitId);
          const imageSrc =
            typeof outfit.imageURL === "string"
              ? outfit.imageURL
              : FALLBACK_IMAGE;

          return (
            <button
              key={outfitId}
              type="button"
              onClick={() => selectOutfit(outfit)}
              className={cn(
                "group cursor-pointer overflow-hidden rounded-xl border-2 bg-background text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
                complete
                  ? "border-green-500/50 bg-green-50/30"
                  : "border-border/60 hover:border-primary/50",
              )}
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={imageSrc}
                  alt={outfit.name}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {complete && (
                  <div className="absolute right-2 top-2">
                    <Badge className="border-0 bg-green-500 text-white">
                      <CheckCircle className="mr-1 size-3" />
                      Done
                    </Badge>
                  </div>
                )}
              </div>
              <div className="space-y-2 p-3">
                <p className="line-clamp-1 text-sm font-semibold">{outfit.name}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Package className="size-3" />
                    Min: {min}
                  </span>
                  <span className="flex items-center gap-1">
                    <Shirt className="size-3" />
                    Stock: {totalStock(outfit)}
                  </span>
                </div>
                {current > 0 && (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all duration-500"
                      style={{width: `${Math.min(100, (current / min) * 100)}%`}}
                    />
                  </div>
                )}
                {current > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {current}/{min} units added
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
