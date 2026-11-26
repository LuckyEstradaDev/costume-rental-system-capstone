"use client";

import {useQuery} from "@tanstack/react-query";
import {BrowsePriceAmount} from "./BrowsePriceAmount";
import Image from "next/image";
import Link from "next/link";
import {Star} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Card} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {getColorValue} from "@/features/admin-dashboard/inventory-tab/constants/constants";
import {StarRating} from "@/features/user-dashboard/review/components/StarRating";
import {getReviewsByOutfitId} from "@/features/user-dashboard/review/services/reviewService";
import type {IReview} from "@/features/user-dashboard/review/types/IReview";
import {buildOutfitPath} from "@/lib/reference-path";
import {OutfitBranchBadge} from "@/features/reusable/OutfitBranchBadge";
import {getOutfitArFit} from "../utils/outfitAr";

export function OutfitCard({outfit, priceMode = "rent"}: {outfit: IOutfit; priceMode?: "rent" | "purchase"}) {
  const price = priceMode === "rent" ? outfit.rentalPrice : outfit.price;

  const outfitId = outfit._id ?? "";
  const {data: reviews} = useQuery<IReview[]>({
    queryKey: ["outfit-reviews", outfitId],
    queryFn: async () => (await getReviewsByOutfitId(outfitId)).data,
    enabled: Boolean(outfitId),
    staleTime: 60_000,
  });
  const average = reviews?.length
    ? reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length
    : null;
  const colors = [...new Set((outfit.variants ?? []).map(({color}) => color?.trim()).filter(Boolean))];

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
  const {canTryInAR} = getOutfitArFit(outfit);

  return (
    <Card className="group relative h-full cursor-pointer overflow-hidden border border-border/60 bg-background py-0 transition-shadow hover:shadow-lg">
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

        <div className="absolute left-2 top-2 flex flex-col gap-1 [&_[data-slot=badge]]:text-sm">
          <div className="flex flex-wrap gap-1">
            <OutfitBranchBadge branch={outfit.branch} />

            {canTryInAR && (
              <Badge className="bg-primary text-white backdrop-blur">
                With AR
              </Badge>
            )}
          </div>

          {getStock() <= 0 && <Badge variant="destructive">Out of stock</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {colors.length > 0 && (
          <ul aria-label="Available colors" className="mb-1 flex flex-wrap gap-2">
            {colors.map((color) => (
              <li
                key={color}
                title={color}
                className="size-5 rounded-full border border-foreground/20"
                style={{backgroundColor: getColorValue(color)}}
              >
                <span className="sr-only">{color}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="line-clamp-2 text-base font-medium leading-tight">
          {outfit.name}
        </p>

        <div>
          <TooltipProvider>
            {typeof price === "number" && price > 0 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="relative z-20 inline-flex cursor-help items-center">
                    <BrowsePriceAmount price={price} />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {priceMode === "rent" ? "Rental price" : "Purchase price"}
                </TooltipContent>
              </Tooltip>
            ) : (
              <p className="text-sm text-muted-foreground">
                {priceMode === "rent" ? "Unavailable for rent" : "Unavailable for purchase"}
              </p>
            )}
          </TooltipProvider>
        </div>
        {reviews && (
          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1 text-sm text-muted-foreground">
            {average === null ? (
              <>
                <Star className="size-3 text-accent" aria-hidden />
                <span>0 (0)</span>
              </>
            ) : (
              <>
                <StarRating value={average} size="sm" />
                <span>{average.toFixed(1)} ({reviews.length})</span>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
