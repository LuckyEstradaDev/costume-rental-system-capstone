import Image from "next/image";
import Link from "next/link";
import {CalendarClock, CreditCard} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Card} from "@/components/ui/card";
import type {IPackage} from "@/features/admin-dashboard/packages/types/IPackage";

const FALLBACK_IMAGE = "/assets/images/landing-page/suit.jpg";

export function PackageCard({packageItem}: {packageItem: IPackage}) {
  const imageSrc = packageItem.imageURL?.[0] || FALLBACK_IMAGE;
  const packageSlug = buildPackageSlug(packageItem.name, packageItem._id);
  const detailHref = packageSlug
    ? `/dashboard/browse/package/${packageSlug}`
    : undefined;

  return (
    <Card className="group cursor-pointer overflow-hidden border border-border/60 bg-background py-0 transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {detailHref ? (
          <Link href={detailHref} className="block size-full">
            <Image
              src={imageSrc}
              alt={packageItem.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        ) : (
          <Image
            src={imageSrc}
            alt={packageItem.name}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <Badge className="bg-black/70 text-white backdrop-blur">
            Package
          </Badge>
        </div>
      </div>

      <div className="space-y-1 p-3">
        {detailHref ? (
          <Link
            href={detailHref}
            className="line-clamp-2 text-sm font-medium leading-tight hover:underline"
          >
            {packageItem.name}
          </Link>
        ) : (
          <p className="line-clamp-2 text-sm font-medium leading-tight">
            {packageItem.name}
          </p>
        )}
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {packageItem.items?.length ?? 0} outfits included
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-muted-foreground">
          {packageItem.rentalTotal != null && packageItem.rentalTotal > 0 && (
            <span className="flex items-center gap-1">
              <CalendarClock className="size-4 text-primary" />
              <span className="font-semibold text-primary">
                ₱{packageItem.rentalTotal.toLocaleString()}
              </span>
            </span>
          )}
          {packageItem.purchaseTotal != null &&
            packageItem.purchaseTotal > 0 && (
              <span className="flex items-center gap-1">
                <CreditCard className="size-4 text-primary" />
                <span className="font-semibold text-primary">
                  ₱{packageItem.purchaseTotal.toLocaleString()}
                </span>
              </span>
            )}
        </div>
      </div>
    </Card>
  );
}

function buildPackageSlug(name: string, packageId?: string) {
  if (!packageId) return "";
  const normalizedName = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${normalizedName}-${packageId}`;
}
