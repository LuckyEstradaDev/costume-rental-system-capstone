import {BrowsePriceAmount} from "./BrowsePriceAmount";
import Image from "next/image";
import Link from "next/link";

import {Card} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {IPackage} from "@/features/admin-dashboard/packages/types/IPackage";
import {buildPackagePath} from "@/lib/reference-path";

const FALLBACK_IMAGE = "/assets/images/landing-page/suit.jpg";

export function PackageCard({packageItem, priceMode = "rent"}: {packageItem: IPackage; priceMode?: "rent" | "purchase"}) {
  const price = priceMode === "rent" ? packageItem.rentalTotal : packageItem.purchaseTotal;

  const imageSrc = packageItem.imageURL?.[0] || FALLBACK_IMAGE;
  const detailHref =
    buildPackagePath(packageItem.referenceID) ||
    buildPackagePath(packageItem._id) ||
    "/dashboard/browse";

  return (
    <Link
      href={detailHref}
      aria-label={`View ${packageItem.name}`}
      className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="group relative h-full cursor-pointer overflow-hidden border border-border/60 bg-background py-0 transition-shadow hover:shadow-lg">

        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageSrc}
            alt={packageItem.name || "Package"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="space-y-1 p-3">
          <p className="line-clamp-2 text-sm font-medium leading-tight">
            {packageItem.name}
          </p>
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
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {packageItem.items?.length ?? 0} outfits included
          </p>
        </div>
      </Card>
    </Link>
  );
}
