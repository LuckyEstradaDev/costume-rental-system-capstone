"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {useParams} from "next/navigation";
import {useState} from "react";
import {useQueries, useQuery} from "@tanstack/react-query";
import {
  CalendarClock,
  ChevronLeft,
  CreditCard,
  Package,
  Palette,
  Ruler,
  Shirt,
  Star,
} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {fetchBundleById} from "@/features/admin-dashboard/bundles/services/BundleService";
import type {IBundle} from "@/features/admin-dashboard/bundles/types/IBundle";
import type {
  IOutfit,
  Variant,
} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {getReviewsByOutfitId} from "@/features/user-dashboard/review/services/reviewService";
import type {IReview} from "@/features/user-dashboard/review/types/IReview";

const FALLBACK_IMAGE = "/assets/images/landing-page/suit.jpg";

const getIdFromSlug = (slug: string) => slug.split("-").at(-1) ?? "";

const buildOutfitSlug = (name: string, outfitId?: string) => {
  if (!outfitId) return "";
  const normalizedName = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${normalizedName}-${outfitId}`;
};

function formatPrice(value?: number) {
  return value ? `PHP ${value.toLocaleString()}` : "Not set";
}

function totalStock(outfit: IOutfit) {
  return outfit.variants.reduce(
    (total, variant) =>
      total + variant.sizes.reduce((sum, size) => sum + size.stock, 0),
    0,
  );
}

function StarRating({value}: {value: number}) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${value} out of 5 stars`}
    >
      {Array.from({length: 5}).map((_, index) => (
        <Star
          key={index}
          className={`size-3.5 ${
            index < Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}

function OutfitReviews({
  outfit,
  reviews,
}: {
  outfit: IOutfit;
  reviews: IReview[];
}) {
  if (!outfit._id) return null;

  return (
    <details className="rounded-xl border bg-muted/20 p-4">
      <summary className="cursor-pointer list-none text-sm font-medium">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>Reviews for {outfit.name}</span>
          <Badge variant="secondary" className="rounded-full">
            {reviews.length}
          </Badge>
        </div>
      </summary>
      <div className="mt-4 space-y-3">
        {reviews.length ? (
          reviews.map((review, index) => (
            <div
              key={review._id ?? `${review.outfitID}-${index}`}
              className="rounded-lg border bg-background p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">
                  {review.userSnapshot?.fullname || "Customer"}
                </p>
                <StarRating value={review.stars} />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {review.comment || "No written comment."}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        )}
      </div>
    </details>
  );
}

function OutfitDetails({
  outfit,
  reviews,
}: {
  outfit: IOutfit;
  reviews: IReview[];
}) {
  const detailHref = buildOutfitSlug(outfit.name, outfit._id)
    ? `/dashboard/browse/${buildOutfitSlug(outfit.name, outfit._id)}`
    : undefined;

  return (
    <article className="space-y-5 rounded-2xl border bg-background p-4 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-48">
          <img
            src={
              typeof outfit.imageURL === "string"
                ? outfit.imageURL
                : FALLBACK_IMAGE
            }
            alt={outfit.name}
            className="size-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          {detailHref ? (
            <Link
              href={detailHref}
              className="text-2xl font-semibold tracking-tight hover:underline"
            >
              {outfit.name}
            </Link>
          ) : (
            <h2 className="text-2xl font-semibold tracking-tight">
              {outfit.name}
            </h2>
          )}
          <div className="flex flex-wrap gap-2">
            <Badge>{outfit.category}</Badge>
            {outfit.fabricType && (
              <Badge variant="secondary">{outfit.fabricType}</Badge>
            )}
            <Badge variant={totalStock(outfit) > 0 ? "outline" : "destructive"}>
              {totalStock(outfit) > 0
                ? `${totalStock(outfit)} available`
                : "Out of stock"}
            </Badge>
          </div>
          <p className="text-sm leading-7 text-muted-foreground">
            {outfit.description || "No description available yet."}
          </p>
          <div className="flex flex-wrap gap-5 text-sm">
            <span className="font-medium">
              Buy: {formatPrice(Number(outfit.price))}
            </span>
            <span className="font-medium">
              Rent: {formatPrice(Number(outfit.rentalPrice))}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Palette className="size-4 text-muted-foreground" />
            Colors and sizes
          </div>
          {outfit.variants.length ? (
            outfit.variants.map((variant: Variant, index) => (
              <div
                key={variant._id ?? `${variant.color}-${index}`}
                className="space-y-2 rounded-lg border bg-background p-3"
              >
                <p className="text-sm font-medium">
                  {variant.color || "Unnamed color"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {variant.sizes.map((size, sizeIndex) => (
                    <Badge
                      key={`${size.size}-${sizeIndex}`}
                      variant={size.stock > 0 ? "outline" : "secondary"}
                    >
                      {size.size || "No size"}: {size.stock} in stock
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No variants available.
            </p>
          )}
        </div>

        <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Ruler className="size-4 text-muted-foreground" />
            Measurements
          </div>
          {outfit.variants.flatMap((variant) =>
            variant.sizes.flatMap((size) =>
              Object.entries(size.measurements ?? {}).map(([key, value]) => (
                <div
                  key={`${size.size}-${key}`}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <span className="capitalize text-muted-foreground">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                  <span className="font-medium">{value} cm</span>
                </div>
              )),
            ),
          )}
          {!outfit.variants.some((variant) =>
            variant.sizes.some(
              (size) => Object.keys(size.measurements ?? {}).length,
            ),
          ) && (
            <p className="text-sm text-muted-foreground">
              No measurements available.
            </p>
          )}
        </div>
      </div>

      <OutfitReviews outfit={outfit} reviews={reviews} />
    </article>
  );
}

function BundleGallery({images, name}: {images: string[]; name: string}) {
  const galleryImages = images.length ? images : [FALLBACK_IMAGE];
  const [selectedImage, setSelectedImage] = useState(galleryImages[0]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl border bg-muted sm:aspect-16/10">
        <img
          src={selectedImage}
          alt={name}
          className="size-full object-cover"
        />
      </div>
      {galleryImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {galleryImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedImage(image)}
              aria-label={`View bundle image ${index + 1}`}
              className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 ${selectedImage === image ? "border-primary" : "border-transparent"}`}
            >
              <img src={image} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BrowseBundlePage() {
  const params = useParams<{bundleSlug?: string | string[]}>();
  const rawSlug = Array.isArray(params.bundleSlug)
    ? params.bundleSlug[0]
    : params.bundleSlug;
  const bundleId = rawSlug ? getIdFromSlug(rawSlug) : "";
  const {
    data: bundle,
    isLoading,
    isError,
  } = useQuery<IBundle>({
    queryKey: ["bundle", bundleId],
    queryFn: () => fetchBundleById(bundleId),
    enabled: Boolean(bundleId),
  });

  const reviewQueries = useQueries({
    queries: (bundle?.items ?? []).map((outfit) => ({
      queryKey: ["outfit-reviews", outfit._id],
      queryFn: async () =>
        (await getReviewsByOutfitId(outfit._id!)).data as IReview[],
      enabled: Boolean(outfit._id),
    })),
  });

  if (isLoading || !bundleId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground">
        Loading package...
      </div>
    );
  }
  if (isError || !bundle) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground">
        Unable to find this package.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 md:px-8 md:py-10">
        <Link
          href="/dashboard/browse"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> Back to browse
        </Link>

        <section className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] xl:gap-12">
          <BundleGallery images={bundle.imageURL ?? []} name={bundle.name} />
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge>
                  <Package className="mr-1 size-3" />
                  Package
                </Badge>
                <Badge variant="secondary">{bundle.items.length} outfits</Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
                {bundle.name}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                A curated package of {bundle.items.length} outfits for a
                complete look.
              </p>
            </div>
            <div className="grid gap-4 border-y py-6 sm:grid-cols-2">
              {(bundle.mode === "purchase" || bundle.mode === "both") && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-900">
                    <CreditCard className="size-4" />
                    Buying Price
                  </div>
                  <p className="text-3xl font-semibold text-amber-950">
                    {formatPrice(bundle.purchaseTotal ?? 0)}
                  </p>
                </div>
              )}
              {(bundle.mode === "rental" || bundle.mode === "both") && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-900">
                    <CalendarClock className="size-4" />
                    Rental Price
                  </div>
                  <p className="text-3xl font-semibold text-emerald-950">
                    {formatPrice(bundle.rentalTotal ?? 0)}
                  </p>
                </div>
              )}
            </div>
            <div className="grid gap-4 pt-2 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Included outfits
                </p>
                <p className="mt-1 font-medium">{bundle.items.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Package images
                </p>
                <p className="mt-1 font-medium">
                  {bundle.imageURL?.length ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Availability
                </p>
                <p className="mt-1 font-medium">
                  {bundle.items.reduce(
                    (sum, outfit) => sum + totalStock(outfit),
                    0,
                  )}{" "}
                  pieces
                </p>
              </div>
            </div>
          </div>
        </section>

        <Separator />
        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Included outfits
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore the details of every outfit in this package.
            </p>
          </div>
          {bundle.items.map((outfit, index) => (
            <OutfitDetails
              key={outfit._id ?? `${outfit.name}-${index}`}
              outfit={outfit}
              reviews={
                (reviewQueries[index]?.data as IReview[] | undefined) ?? []
              }
            />
          ))}
        </section>
      </div>
    </main>
  );
}
