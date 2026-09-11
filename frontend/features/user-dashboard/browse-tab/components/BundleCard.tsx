import Image from "next/image";
import Link from "next/link";
import {CalendarClock, CreditCard, PackageCheck} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Card} from "@/components/ui/card";
import type {IBundle} from "@/features/admin-dashboard/bundles/types/IBundle";

const FALLBACK_IMAGE = "/assets/images/landing-page/suit.jpg";

export function BundleCard({bundle}: {bundle: IBundle}) {
  const imageSrc = bundle.imageURL?.[0] || FALLBACK_IMAGE;
  const bundleSlug = buildPackageSlug(bundle.name, bundle._id);
  const detailHref = bundleSlug
    ? `/dashboard/browse/packages/package/${bundleSlug}`
    : undefined;
  const totalStock = (bundle.items ?? []).reduce(
    (total, outfit) =>
      total +
      outfit.variants.reduce(
        (variantTotal, variant) =>
          variantTotal +
          variant.sizes.reduce((sizeTotal, size) => sizeTotal + size.stock, 0),
        0,
      ),
    0,
  );

  return (
    <Card className="group cursor-pointer overflow-hidden border border-border/60 bg-background py-0 transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {detailHref ? (
          <Link href={detailHref} className="block size-full">
            <Image
              src={imageSrc}
              alt={bundle.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        ) : (
          <Image
            src={imageSrc}
            alt={bundle.name}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <Badge className="bg-black/70 text-white backdrop-blur">
            Package
          </Badge>
          {totalStock <= 0 && <Badge variant="destructive">Out of stock</Badge>}
        </div>
      </div>

      <div className="space-y-1 p-3">
        {detailHref ? (
          <Link
            href={detailHref}
            className="line-clamp-2 text-sm font-medium leading-tight hover:underline"
          >
            {bundle.name}
          </Link>
        ) : (
          <p className="line-clamp-2 text-sm font-medium leading-tight">
            {bundle.name}
          </p>
        )}
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {bundle.items?.length ?? 0} outfits included
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
          {totalStock > 0 ? `${totalStock} pieces available` : "No stock"}
        </p>
      </div>
    </Card>
  );
}

function buildPackageSlug(name: string, bundleId?: string) {
  if (!bundleId) return "";
  const normalizedName = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${normalizedName}-${bundleId}`;
}
