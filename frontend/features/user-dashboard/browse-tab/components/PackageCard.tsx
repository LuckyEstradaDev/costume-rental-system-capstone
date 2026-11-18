import Image from "next/image";
import Link from "next/link";
import {CalendarClock, CreditCard} from "lucide-react";

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

export function PackageCard({packageItem}: {packageItem: IPackage}) {
  const imageSrc = packageItem.imageURL?.[0] || FALLBACK_IMAGE;
  const detailHref = buildPackagePath(packageItem.referenceID) || undefined;

  return (
    <Card className="group relative h-full cursor-pointer overflow-hidden border border-border/60 bg-background py-0 transition-shadow hover:shadow-lg">
      {detailHref && (
        <Link
          href={detailHref}
          aria-label={`View ${packageItem.name}`}
          className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      )}

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
          <div className="flex flex-col items-start gap-1 pt-1 text-sm text-muted-foreground">
            {packageItem.purchaseTotal != null &&
              packageItem.purchaseTotal > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="relative z-20 inline-flex cursor-help items-center gap-1">
                      <CreditCard
                        className="size-4 text-primary"
                        aria-hidden
                      />
                      <span className="font-semibold text-primary">
                        ₱{packageItem.purchaseTotal.toLocaleString()}
                      </span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">Purchase price</TooltipContent>
                </Tooltip>
              )}
            {packageItem.rentalTotal != null && packageItem.rentalTotal > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="relative z-20 inline-flex cursor-help items-center gap-1">
                    <CalendarClock
                      className="size-4 text-primary"
                      aria-hidden
                    />
                    <span className="font-semibold text-primary">
                      ₱{packageItem.rentalTotal.toLocaleString()}
                    </span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">Rental price</TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {packageItem.items?.length ?? 0} outfits included
        </p>
      </div>
    </Card>
  );
}
