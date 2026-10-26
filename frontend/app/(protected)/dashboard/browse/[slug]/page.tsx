"use client";

import Image from "next/image";
import Link from "next/link";
import {useState} from "react";
import {useParams} from "next/navigation";
import {
  CalendarClock,
  ChevronLeft,
  Package,
  Palette,
  PersonStanding,
  Ruler,
  ScanFace,
  Star,
  Shirt,
  MessageSquare,
} from "lucide-react";

import {UserAvatar} from "@/components/UserAvatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {useNotification} from "@/components/ui/alert";
import {IOutfit, Variant} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {getColorValue} from "@/features/admin-dashboard/inventory-tab/constants/constants";
import {getSizeIconClass} from "@/lib/size";
import {fetchOutfitById} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {addToCartService} from "@/features/user-dashboard/cart/services/cartService";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {ICartItem} from "@/features/user-dashboard/cart/types/ICart";
import {getReviewsByOutfitId} from "@/features/user-dashboard/review/services/reviewService";
import {StarRating} from "@/features/user-dashboard/review/components/StarRating";
import {IReview} from "@/features/user-dashboard/review/types/IReview";
import {formatReadableDate} from "@/lib/formatters";
import {AR} from "@/features/user-dashboard/browse-tab/components/AR";
import type {GarmentMeasurements} from "@/features/user-dashboard/browse-tab/lib/bodyFit";
import {BrowseOutfitSkeleton} from "@/features/user-dashboard/browse-tab/components/Skeleton";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {
  isObjectId,
  isOutfitReference,
  normalizeReference,
} from "@/lib/reference-path";
import {MEASUREMENT_LABELS} from "@/lib/measurements";
import {NotFoundView} from "@/features/reusable/NotFoundView";

function formatPrice(value?: number | string) {
  return `₱${Number(value ?? 0).toLocaleString()}`;
}

// ─── Rating breakdown bar ───────────────────────────────────────────────────

function RatingBar({star, count, total}: {star: number; count: number; total: number}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-3 text-right text-muted-foreground">{star}</span>
      <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" />
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{width: `${pct}%`}} />
      </div>
      <span className="w-5 text-right text-muted-foreground">{count}</span>
    </div>
  );
}

// ─── Single review card ─────────────────────────────────────────────────────

function ReviewItem({review}: {review: IReview}) {
  const fullname = review.userSnapshot?.fullname?.trim() || "Customer";
  const [firstName, ...lastNameParts] = fullname.split(/\s+/);
  const lastName = lastNameParts.join(" ");

  return (
    <article className="rounded-xl bg-card p-4 shadow-sm ring-1 ring-border/60 sm:p-5">
      <div className="flex items-start gap-3.5">
        <UserAvatar
          size="md"
          src={review.profilePicture}
          firstName={firstName}
          lastName={lastName}
          className="bg-primary/10 text-primary"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight text-foreground">
                {fullname}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {review.createdAt
                  ? formatReadableDate(review.createdAt)
                  : "Customer review"}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-muted/70 px-2.5 py-1">
              <StarRating value={review.stars} />
              <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                {review.stars}.0
              </span>
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-foreground/80">
            {review.comment || (
              <span className="italic text-muted-foreground">
                No written comment.
              </span>
            )}
          </p>
        </div>
      </div>
    </article>
  );
}

// ─── Reviews section ────────────────────────────────────────────────────────

function ReviewsSection({reviews, isLoading}: {reviews: IReview[]; isLoading: boolean}) {
  const total = reviews.length;
  const average = total ? reviews.reduce((s, r) => s + r.stars, 0) / total : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.stars === star).length,
  }));

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
          <MessageSquare className="size-4 text-primary" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Customer reviews
        </h2>
        {total > 0 && (
          <Badge variant="secondary" className="rounded-full">
            {total}
          </Badge>
        )}
      </div>

      {total > 0 && (
        <div className="mb-6 grid gap-5 rounded-xl bg-muted/20 p-5 ring-1 ring-border/60 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-6 sm:p-6">
          <div className="flex flex-col items-center justify-center gap-1.5 sm:border-r sm:border-border/60 sm:pr-6">
            <span className="text-4xl font-bold tabular-nums tracking-tight text-foreground">
              {average.toFixed(1)}
            </span>
            <StarRating value={average} size="md" />
            <span className="mt-0.5 text-xs text-muted-foreground">
              Based on {total} {total === 1 ? "review" : "reviews"}
            </span>
          </div>

          <div className="flex flex-col justify-center gap-2">
            {distribution.map(({star, count}) => (
              <RatingBar key={star} star={star} count={count} total={total} />
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-muted/30 ring-1 ring-border/60"
            />
          ))}
        </div>
      ) : total === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/70 py-14 text-center">
          <Star className="size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            No reviews yet
          </p>
          <p className="text-xs text-muted-foreground/70">
            Be the first to share your experience with this outfit.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review, index) => (
            <ReviewItem
              key={review._id ?? `${review.outfitID}-${index}`}
              review={review}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function BrowseOutfitPage() {
  const [selectedSize, setSelectedSize] = useState<string>();
  const {user} = useAuth();
  const [selectedVariant, setSelectedVariant] = useState<Variant>();
  const [loading, setLoading] = useState(false);
  const [isARDisplayed, setARDisplay] = useState(false);
  const {isAuthenticated, openAuthModal} = useAuth();

  const params = useParams<{slug?: string | string[]}>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const {notify} = useNotification();
  const queryClient = useQueryClient();

  const outfitReference = normalizeReference(slug);
  const isValidOutfitIdentifier =
    isOutfitReference(outfitReference) || isObjectId(outfitReference);
  const {data: currentOutfit, isLoading: isOutfitLoading} = useQuery<IOutfit>({
    queryKey: ["outfit", outfitReference],
    queryFn: () => fetchOutfitById(outfitReference),
    enabled: isValidOutfitIdentifier,
  });
  const outfitID = currentOutfit?._id ?? "";
  const {data: outfitReviews = [], isLoading: isReviewsLoading} = useQuery<IReview[]>({
    queryKey: ["outfit-reviews", outfitID],
    queryFn: async () => {
      const {data} = await getReviewsByOutfitId(outfitID);
      return data;
    },
    enabled: Boolean(outfitID),
  });

  const handleColorSelect = (variant: Variant) => {
    setSelectedVariant(variant);
    setSelectedSize(undefined);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      openAuthModal(true);
      return;
    }
    // Validate first: setLoading(true) here used to leave the button stuck in
    // its loading state whenever a validation branch returned early.
    if (!selectedVariant || !selectedSize) {
      notify({
        title: "Select a variant",
        description: "Please select a color and size first.",
        variant: "warning",
      });
      return;
    }

    if (selectedVariant?.sizes?.find((s) => s.size === selectedSize)?.stock === 0) {
      notify({
        title: "Out of stock",
        description: "Selected variant and size is out of stock.",
        variant: "error",
      });
      return;
    }

    setLoading(true);

    const cartForm: ICartItem = {
      userId: user?._id || "",
      items: [
        {
          outfitId: currentOutfit?._id || "",
          outfitReferenceID: currentOutfit?.referenceID,
          variantId: selectedVariant?._id || "",
          size: selectedSize || "",
          color: selectedVariant?.color || "",
          quantity: 1,
          name: currentOutfit?.name || "",
          category: currentOutfit?.category || "",
          imageURL:
            typeof currentOutfit?.imageURL === "string"
              ? currentOutfit.imageURL
              : "/assets/images/landing-page/suit.jpg",
          price: Number(currentOutfit?.price) || 0,
          rentalPrice: Number(currentOutfit?.rentalPrice) || 0,
        },
      ],
    };

    if (cartForm) {
      try {
        await addToCartService(cartForm);
        await queryClient.invalidateQueries({queryKey: ["cart", user?._id]});
        notify({
          title: "Added to cart",
          description: "The outfit has been added to your cart.",
          variant: "success",
        });
      } catch (error) {
        notify({
          title: "Add failed",
          description:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error as any)?.response?.data?.message ??
            "Unable to add this outfit to cart.",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isValidOutfitIdentifier) {
    return (
      <NotFoundView
        title="Outfit not found"
        description="This outfit reference is invalid or no longer available. Browse the collection to find another outfit."
      />
    );
  }

  if (isOutfitLoading && !currentOutfit) return <BrowseOutfitSkeleton />;

  if (!currentOutfit) {
    return (
      <NotFoundView
        title="Outfit not found"
        description="This outfit may have been removed or is no longer available."
      />
    );
  }

  // Some payloads can arrive without `variants`/`sizes` keys — normalize so
  // the derived values below can never throw.
  const variants = Array.isArray(currentOutfit.variants) ? currentOutfit.variants : [];

  const outfitImage =
    typeof currentOutfit.imageURL === "string" ? currentOutfit.imageURL : "/assets/images/landing-page/suit.jpg";

  // AR is only offered for outfits that have an uploaded 3D model.
  const arModelUrl =
    typeof currentOutfit.modelURL === "string" && currentOutfit.modelURL ? currentOutfit.modelURL : undefined;

  // Real per-size garment measurements (inches) for the AR fit checker. The
  // first size entry that carries any numbers wins — duplicate sizes across
  // color variants share the same cut.
  const sizeMeasurements: Record<string, GarmentMeasurements> = {};
  for (const variant of variants) {
    for (const size of variant.sizes ?? []) {
      if (!size.size || sizeMeasurements[size.size]) continue;
      const measurements = size.measurements;
      if (!measurements) continue;
      const entry: GarmentMeasurements = {
        chest: measurements.chest,
        bust: measurements.bust,
        shoulder: measurements.shoulder,
        outfitLength: measurements.outfitLength,
      };
      if (Object.values(entry).some((value) => typeof value === "number" && value > 0)) {
        sizeMeasurements[size.size] = entry;
      }
    }
  }

  // A size is only offered in AR when its shoulder can actually be judged —
  // no shoulder measurement, no option. Sizes without one stay available in
  // the add-to-cart selector; they just cannot be fit-checked.
  const arSizes = [
    ...new Set(
      variants
        .flatMap((variant) => (variant.sizes ?? []).map((size) => size.size))
        .filter((size) => {
          const shoulder = size ? sizeMeasurements[size]?.shoulder : undefined;
          return typeof shoulder === "number" && shoulder > 0;
        }),
    ),
  ];

  // AR is only offered when the outfit has a model AND at least one size whose
  // shoulder can be measured.
  const canTryInAR = Boolean(arModelUrl) && arSizes.length > 0;

  const totalStock = variants.reduce(
    (total, variant) =>
      total +
      (variant.sizes ?? []).reduce((variantTotal, size) => variantTotal + (size.stock ?? 0), 0),
    0,
  );

  const activeSizes = selectedVariant?.sizes ?? [];
  const selectedSizeData = activeSizes.find((size) => size.size === selectedSize);
  const selectedSizeStock = selectedSizeData?.stock ?? null;

  const selectedSizeMeasurements = Object.entries(selectedSizeData?.measurements ?? {}).filter(
    ([, value]) => value != null && value > 0,
  ) as [string, number][];

  const hasVariants = variants.length > 0;
  const canAddToCart =
    Boolean(selectedVariant) && Boolean(selectedSize) && selectedSizeStock !== null && selectedSizeStock > 0;

  // ─── Reusable blocks (defined once, rendered in different orders below) ──

  const imageBlock = (
    <div className="relative aspect-4/3 overflow-hidden rounded-2xl border bg-muted sm:aspect-16/11">
      <Image src={outfitImage} alt={currentOutfit?.name || "Outfit"} fill className="object-cover" priority />
    </div>
  );

  const titleDescBlock = (
    <div className="space-y-3">
      <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
        {currentOutfit?.name || "Outfit name not available"}
      </h1>
      <p className="max-w-2xl text-base leading-7 text-muted-foreground">
        {currentOutfit?.description || "No description available yet."}
      </p>
    </div>
  );

  const priceBlock = (
    <div className="grid gap-4 sm:grid-cols-2">
      {currentOutfit?.rentalPrice ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-primary">
            <CalendarClock className="size-3.5" />
            Rental
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums text-foreground">
            {formatPrice(currentOutfit.rentalPrice)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">per rental period</p>
        </div>
      ) : null}

      {currentOutfit?.price ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            <Package className="size-3.5" />
            Purchase
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums text-foreground">
            {formatPrice(currentOutfit.price)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">one-time purchase</p>
        </div>
      ) : null}
    </div>
  );

  const colorsBlock = (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Palette className="size-4 text-muted-foreground" />
        <span>Colors</span>
      </div>
      {hasVariants ? (
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => {
            const color = variant.color || "Unnamed color";
            const isActive = selectedVariant?._id === variant._id;
            return (
              <button
                key={variant._id ?? color}
                onClick={() => handleColorSelect(variant)}
                title={color}
                aria-label={color}
                className={`flex size-10 items-center justify-center rounded-full border-2 transition-colors ${
                  isActive ? "border-primary" : "border-transparent hover:scale-105"
                }`}
              >
                <span
                  className="size-6 rounded-full border border-foreground/20"
                  style={{
                    backgroundColor: getColorValue(color),
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
                  }}
                />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed px-4 py-5 text-sm text-muted-foreground">
          No color variants available.
        </div>
      )}
    </div>
  );

  const sizesBlock = selectedVariant && (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Ruler className="size-4 text-muted-foreground" />
        <span>Sizes</span>
      </div>
      {activeSizes.length === 0 ? (
        <div className="rounded-xl border border-dashed px-4 py-5 text-sm text-muted-foreground">Not available.</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {activeSizes.map((sizeOption) => {
            const size = sizeOption.size || "No size";
            const isSelected = selectedSize === sizeOption.size;
            const isAvailable = sizeOption.stock > 0;
            return (
              <button
                key={`${selectedVariant._id ?? selectedVariant.color}-${size}-${sizeOption.stock}`}
                onClick={() => isAvailable && handleSizeSelect(sizeOption.size)}
                disabled={!isAvailable}
                aria-label={`Size ${size}`}
                className={`flex flex-col items-center justify-center gap-1 rounded-md border px-4 py-2.5 text-sm transition ${
                  isSelected && isAvailable ? "border-primary bg-primary text-primary-foreground" : ""
                } ${
                  !isSelected && isAvailable
                    ? "border-border bg-background hover:border-foreground/40 hover:bg-muted/50"
                    : ""
                } ${
                  !isAvailable
                    ? "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-70"
                    : "cursor-pointer"
                }`}
              >
                <PersonStanding className={`${getSizeIconClass(size)} ${isAvailable ? "" : "opacity-60"}`} />
                <span>{size}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  // Stock + measurements, styled to sit tight against the Add to Cart button
  const stockMeasurementsBlock = selectedVariant && selectedSize && (
    <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Stock Availability</p>
        <p className="text-sm text-foreground">
          {selectedSizeStock && selectedSizeStock > 0 ? `${selectedSizeStock} piece(s) available` : "Not available"}
        </p>
      </div>

      {selectedSizeMeasurements.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground mb-3">Measurements</p>
          <div className="flex flex-wrap gap-3">
            {selectedSizeMeasurements.map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm">
                <Ruler className="size-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{MEASUREMENT_LABELS[key] ?? key}</span>
                <span className="font-medium text-foreground">{value} in</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const addToCartBlock = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={handleAddToCart}
          className="w-full cursor-pointer sm:w-auto sm:min-w-56"
          size="lg"
          disabled={!canAddToCart || loading}
        >
          {loading ? "Loading..." : "Add to Cart"}
        </Button>

        {canTryInAR && (
          <Button
            onClick={() => setARDisplay(true)}
            variant="outline"
            className="w-full cursor-pointer sm:w-auto"
            size="lg"
          >
            <ScanFace aria-hidden className="size-5" />
            Try in AR
          </Button>
        )}
      </div>
    </div>
  );

  // Secondary / reference info, not needed to decide, so it's de-prioritized on mobile
  const catInfoBlock = (
    <div className="grid gap-4 pt-5 text-sm sm:grid-cols-3">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Category</p>
        <p className="font-medium text-foreground">{currentOutfit?.category || "Not specified"}</p>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Variants</p>
        <p className="font-medium text-foreground">{hasVariants ? variants.length : "Not available"}</p>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Total Stock</p>
        <p className="font-medium text-foreground">{totalStock > 0 ? totalStock : "Not available"}</p>
      </div>
    </div>
  );

  const materialBlock = currentOutfit?.fabricType && (
    <div className="rounded-xl border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
        <Shirt className="size-4" />
        <span className="uppercase tracking-[0.15em] text-xs">Material</span>
      </div>
      <p className="text-sm font-medium text-foreground">{currentOutfit.fabricType}</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-28 xl:pb-0">
      <Link
        href="/dashboard/browse"
        className="inline-flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Back to browse
      </Link>

      {/* ── Mobile / tablet layout: purchase-critical info first ── */}
      <div className="flex flex-col gap-6 xl:hidden">
        {imageBlock}
        {titleDescBlock}
        {priceBlock}
        {colorsBlock}
        {sizesBlock}
        {stockMeasurementsBlock}
        {catInfoBlock}
        {materialBlock}
      </div>

      {/* ── Desktop layout: original two-column arrangement ── */}
      <div className="hidden xl:grid xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] xl:gap-12">
        <section className="space-y-5">
          {imageBlock}
          {catInfoBlock}
          {materialBlock}
        </section>

        <section className="flex flex-col gap-8">
          {titleDescBlock}
          {priceBlock}
          <div className="space-y-6">
            {colorsBlock}
            {sizesBlock}
          </div>
          {stockMeasurementsBlock}
          {addToCartBlock}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur xl:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 md:px-8">
          {canTryInAR && (
            <Button
              onClick={() => setARDisplay(true)}
              variant="outline"
              size="lg"
              className="shrink-0 cursor-pointer"
            >
              <ScanFace aria-hidden className="size-5" />
              Try in AR
            </Button>
          )}
          <Button
            onClick={handleAddToCart}
            className="w-full cursor-pointer"
            size="lg"
            disabled={!canAddToCart || loading}
          >
            {loading ? "Loading..." : "Add to Cart"}
          </Button>
        </div>
      </div>

      {isARDisplayed && canTryInAR && arModelUrl && (
        <AR
          modelUrl={arModelUrl}
          sizes={arSizes}
          sizeMeasurements={sizeMeasurements}
          onClose={setARDisplay}
        />
      )}

      <ReviewsSection reviews={outfitReviews} isLoading={isReviewsLoading} />
    </div>
  );
}
