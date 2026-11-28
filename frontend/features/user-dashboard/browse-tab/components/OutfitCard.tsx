"use client";

import {useQuery} from "@tanstack/react-query";
import {BrowsePriceAmount} from "./BrowsePriceAmount";
import Image from "next/image";
import Link from "next/link";
import {MapPin, ScanFace, Star} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Card} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {getColorValue, getOutfitBranchLabel} from "@/features/admin-dashboard/inventory-tab/constants/constants";
import {StarRating} from "@/features/user-dashboard/review/components/StarRating";
import {getReviewsByOutfitId} from "@/features/user-dashboard/review/services/reviewService";
import type {IReview} from "@/features/user-dashboard/review/types/IReview";
import {buildOutfitPath} from "@/lib/reference-path";
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
  const branchLabel = getOutfitBranchLabel(outfit.branch);
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

        {getStock() <= 0 && (
          <Badge variant="destructive" className="absolute left-2 top-2 text-sm">
            Out of stock
          </Badge>
        )}
      </div>

      <div className="grid min-w-0 grid-rows-[1.25rem_2.5rem_1.75rem_3rem_1.25rem] gap-2 p-3">
        <div className="min-w-0 overflow-hidden">
          {colors.length > 0 && (
            <ul aria-label="Available colors" className="flex gap-2">
              {colors.map((color) => (
                <li
                  key={color}
                  title={color}
                  className="size-5 shrink-0 rounded-full border border-foreground/20"
                  style={{backgroundColor: getColorValue(color)}}
                >
                  <span className="sr-only">{color}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="line-clamp-2 break-words text-base font-medium leading-tight">
          {outfit.name}
        </p>

        <div className="min-w-0">
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
              <p className="truncate text-sm text-muted-foreground">
                {priceMode === "rent" ? "Unavailable for rent" : "Unavailable for purchase"}
              </p>
            )}
          </TooltipProvider>
        </div>
        <div className="flex min-w-0 flex-col text-base text-muted-foreground">
          {branchLabel && (
            <span className="flex min-w-0 items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden />
              <span className="truncate" title={branchLabel}>{branchLabel}</span>
            </span>
          )}
          {canTryInAR && (
            <span className="flex items-center gap-1.5">
              <ScanFace className="size-4 shrink-0" aria-hidden />
              With AR
            </span>
          )}
        </div>
        {reviews && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
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
