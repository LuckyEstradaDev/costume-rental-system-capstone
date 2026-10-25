import Image from "next/image";
import Link from "next/link";
import {CalendarClock, CreditCard, PackageCheck} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Card} from "@/components/ui/card";
import type {IBundle} from "@/features/admin-dashboard/bundles/types/IBundle";
import {buildPackagePath} from "@/lib/reference-path";

const FALLBACK_IMAGE = "/assets/images/landing-page/suit.jpg";

export function BundleCard({bundle}: {bundle: IBundle}) {
  const imageSrc = bundle.imageURL?.[0] || FALLBACK_IMAGE;
  const detailHref = buildPackagePath(bundle.referenceID) || undefined;
  const totalOutfits = bundle.items?.length ?? 0;

  return (
    <Card className="group relative cursor-pointer overflow-hidden border border-border/60 bg-background py-0 transition-all hover:-translate-y-1 hover:shadow-lg">
      {detailHref && (
        <Link
          href={detailHref}
          aria-label={`View ${bundle.name}`}
          className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      )}

      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={imageSrc}
          alt={bundle.name || "Package"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <Badge className="bg-black/70 text-white backdrop-blur">
            Package
          </Badge>
        </div>
      </div>

      <div className="space-y-1 p-3">
        <p className="line-clamp-2 text-sm font-medium leading-tight">
          {bundle.name}
        </p>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {totalOutfits} outfits included
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-muted-foreground">
          {bundle.rentalTotal != null && bundle.rentalTotal > 0 && (
            <span className="flex items-center gap-1">
              <CalendarClock className="size-4 text-primary" />
              <span className="font-semibold text-primary">
                ₱{bundle.rentalTotal.toLocaleString()}
              </span>
            </span>
          )}
          {bundle.purchaseTotal != null && bundle.purchaseTotal > 0 && (
            <span className="flex items-center gap-1">
              <CreditCard className="size-4 text-primary" />
              <span className="font-semibold text-primary">
                ₱{bundle.purchaseTotal.toLocaleString()}
              </span>
            </span>
          )}
        </div>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <PackageCheck className="size-3.5" />
          {totalOutfits > 0
            ? `${totalOutfits} outfit${totalOutfits === 1 ? "" : "s"} included`
            : "No outfits included"}
        </p>
      </div>
    </Card>
  );
}
