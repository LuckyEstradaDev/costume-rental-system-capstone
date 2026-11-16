"use client";

import Image from "next/image";
import Link from "next/link";
import {useState} from "react";
import {useParams} from "next/navigation";
import {motion} from "framer-motion";
import {ChevronLeft, ScanFace, Star} from "lucide-react";

import {Reveal, staggerContainer, staggerItem} from "@/components/motion";

import {UserAvatar} from "@/components/UserAvatar";
import {Button} from "@/components/ui/button";
import {useNotification} from "@/components/ui/alert";
import {IOutfit, Variant} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {getColorValue} from "@/features/admin-dashboard/inventory-tab/constants/constants";
import {compareSizes, formatSizeLabel} from "@/lib/size";
import {
  fetchOutfitById,
  fetchOutfitSoldCount,
} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {addToCartService} from "@/features/user-dashboard/cart/services/cartService";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {ICartItem} from "@/features/user-dashboard/cart/types/ICart";
import {getReviewsByOutfitId} from "@/features/user-dashboard/review/services/reviewService";
import {StarRating} from "@/features/user-dashboard/review/components/StarRating";
import {IReview} from "@/features/user-dashboard/review/types/IReview";
import {formatReadableDate} from "@/lib/formatters";
import {AR, type GarmentMeasurements} from "@/features/user-dashboard/AR";
import {BrowseOutfitSkeleton} from "@/features/user-dashboard/browse-tab/components/Skeleton";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {
  isObjectId,
  isOutfitReference,
  normalizeReference,
} from "@/lib/reference-path";
import {MEASUREMENT_LABELS} from "@/lib/measurements";
import {cn} from "@/lib/utils";
import {NotFoundView} from "@/features/reusable/NotFoundView";

function formatPrice(value?: number | string) {
  return `₱${Number(value ?? 0).toLocaleString()}`;
}

// ─── Rating breakdown bar ───────────────────────────────────────────────────

function RatingBar({star, count, total}: {star: number; count: number; total: number}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-[14px]">
      <span className="w-3 text-right text-secondary/70">{star}</span>
      <Star className="size-3 shrink-0 fill-accent text-accent" />
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-accent transition-all duration-500" style={{width: `${pct}%`}} />
      </div>
      <span className="w-5 text-right text-secondary/70">{count}</span>
    </div>
  );
}

// ─── Single review card ─────────────────────────────────────────────────────

function ReviewItem({review}: {review: IReview}) {
  const fullname = review.userSnapshot?.fullname?.trim() || "Customer";
  const [firstName, ...lastNameParts] = fullname.split(/\s+/);
  const lastName = lastNameParts.join(" ");

  return (
    <motion.article
      variants={staggerItem}
      className="py-5 first:pt-6 last:pb-0"
    >
      <div className="flex items-start gap-3.5">
        <UserAvatar
          size="md"
          src={review.profilePicture}
          firstName={firstName}
          lastName={lastName}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2.5">
            <div className="min-w-0">
              <p className="truncate text-base leading-tight font-semibold text-primary">
                {fullname}
              </p>
              <p className="mt-1 text-[14px] text-secondary/70">
                {review.createdAt
                  ? formatReadableDate(review.createdAt)
                  : "Customer review"}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <StarRating value={review.stars} />
              <span className="text-[13px] font-medium tabular-nums text-primary">
                {review.stars}
              </span>
            </div>
          </div>

          <p className="mt-3 text-base leading-relaxed text-foreground/80">
            {review.comment || (
              <span className="text-secondary/70 italic">
                No written comment.
              </span>
            )}
          </p>
        </div>
      </div>
    </motion.article>
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
    <section className="mt-12">
      <div className="rounded-2xl bg-background p-5 shadow-sm sm:p-6">
        <h2 className="text-3xl font-semibold text-primary md:text-4xl">
          Customer reviews
        </h2>

        {total > 0 && (
          <div className="mt-6 grid gap-5 border-b border-border pb-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-10">
            <div className="flex flex-col items-center justify-center gap-1.5">
              <span className="text-5xl font-semibold tabular-nums text-primary">
                {average.toFixed(1).replace(/\.0$/, "")}
              </span>
              <StarRating value={average} size="md" />
              <span className="mt-0.5 text-[14px] text-secondary/70">
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
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-200/70" />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="py-10 text-center">
            <p className="text-lg font-semibold text-primary">No reviews yet</p>
            <p className="mt-1 text-base text-secondary/70">
              Be the first to share your experience with this outfit.
            </p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{once: true, amount: 0.1}}
            className="divide-y divide-border"
          >
            {reviews.map((review, index) => (
              <ReviewItem
                key={review._id ?? `${review.outfitID}-${index}`}
                review={review}
              />
            ))}
          </motion.div>
        )}
      </div>
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
  const {data: soldCount, isLoading: isSoldLoading} = useQuery<number>({
    queryKey: ["outfit-sold", outfitID],
    queryFn: () => fetchOutfitSoldCount(outfitID),
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
        sleeveLength: measurements.sleeveLength,
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

  const activeSizes = [...(selectedVariant?.sizes ?? [])].sort((a, b) =>
    compareSizes(a.size, b.size),
  );
  const selectedSizeData = activeSizes.find((size) => size.size === selectedSize);
  const selectedSizeStock = selectedSizeData?.stock ?? null;

  const hasVariants = variants.length > 0;
  const canAddToCart =
    Boolean(selectedVariant) && Boolean(selectedSize) && selectedSizeStock !== null && selectedSizeStock > 0;

  // ─── Reusable blocks (defined once, rendered in different orders below) ──

  const imageBlock = (
    <div className="group relative h-[calc(100svh-13.5rem)] min-h-[18rem] overflow-hidden rounded-2xl bg-background shadow-sm">
      <Image
        src={outfitImage}
        alt={currentOutfit?.name || "Outfit"}
        fill
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        priority
      />
    </div>
  );

  // ─── Rating / reviews / sold stats ───────────────────────────────────────
  const reviewCount = outfitReviews.length;
  const averageRating = reviewCount
    ? outfitReviews.reduce((sum, review) => sum + review.stars, 0) / reviewCount
    : null;
  const reviewCountLabel = isReviewsLoading ? "0" : reviewCount.toLocaleString();
  const soldCountLabel = isSoldLoading || soldCount === undefined ? "0" : soldCount.toLocaleString();

  // ─── Size chart: every size with its measurements (inches) ───────────────
  const chartRowsMap = new Map<string, Record<string, number>>();
  for (const variant of variants) {
    for (const size of variant.sizes ?? []) {
      if (!size.size || chartRowsMap.has(size.size)) continue;
      const values = Object.fromEntries(
        (Object.entries(size.measurements ?? {}) as [string, number | null | undefined][]).filter(
          ([, value]) => typeof value === "number" && value > 0,
        ),
      ) as Record<string, number>;
      if (Object.keys(values).length > 0) chartRowsMap.set(size.size, values);
    }
  }
  const chartRows = [...chartRowsMap.entries()]
    .map(([size, values]) => ({size, values}))
    .sort((a, b) => compareSizes(a.size, b.size));
  const labelOrder = Object.keys(MEASUREMENT_LABELS);
  const chartColumns = [...new Set(chartRows.flatMap((row) => Object.keys(row.values)))].sort(
    (a, b) => {
      const ai = labelOrder.indexOf(a);
      const bi = labelOrder.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    },
  );

  // ─── Section 1, column 2: outfit info ────────────────────────────────────

  const nameBlock = (
    <h1 className="text-[32px] font-semibold tracking-tight text-primary md:text-[40px]">
      {currentOutfit?.name || "Outfit name not available"}
    </h1>
  );

  const statsBlock = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium tracking-[0.12em] text-secondary/70 uppercase">
      <span className="inline-flex items-center gap-1.5">
        <StarRating value={averageRating ?? 0} size="sm" />
        <span className="tabular-nums text-primary">
          {averageRating !== null ? averageRating.toFixed(1).replace(/\.0$/, "") : "0"}
        </span>
      </span>
      <span aria-hidden="true">|</span>
      <span className="tabular-nums">
        {reviewCountLabel} {reviewCount === 1 ? "review" : "reviews"}
      </span>
      <span aria-hidden="true">|</span>
      <span className="tabular-nums">{soldCountLabel} sold</span>
    </div>
  );

  // Rental and purchase are both secondary (navy) cards with white text.
  const priceBlock = (
    <div className="grid grid-cols-2 gap-4">
      {currentOutfit?.rentalPrice ? (
        <div className="rounded-xl bg-secondary p-5 text-secondary-foreground">
          <p className="text-base text-secondary-foreground/70">Rental</p>
          <p className="mt-2 text-[32px] font-semibold tracking-tight tabular-nums">
            {formatPrice(currentOutfit.rentalPrice)}
          </p>
        </div>
      ) : null}

      {currentOutfit?.price ? (
        <div className="rounded-xl bg-secondary p-5 text-secondary-foreground">
          <p className="text-base text-secondary-foreground/70">Purchase</p>
          <p className="mt-2 text-[32px] font-semibold tracking-tight tabular-nums">
            {formatPrice(currentOutfit.price)}
          </p>
        </div>
      ) : null}
    </div>
  );

  // Row layout: label on the left, choices on the right
  const colorsBlock = (
    <div className="grid grid-cols-[7.5rem_1fr] items-center gap-4">
      <div>
        <p className="text-lg font-semibold text-primary">Pick a color</p>
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
                aria-pressed={isActive}
                className={`flex size-12 items-center justify-center rounded-full transition-all duration-200 ${
                  isActive ? "ring-2 ring-primary ring-offset-2" : "hover:scale-110"
                }`}
              >
                <span
                  className="size-9 rounded-full border border-foreground/15 shadow-sm"
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
        <p className="text-base text-secondary/70">No color variants available.</p>
      )}
    </div>
  );

  const sizesBlock = selectedVariant && (
    <div className="grid grid-cols-[7.5rem_1fr] items-start gap-4">
      <p className="pt-2 text-lg font-semibold text-primary">Pick a size</p>
      {activeSizes.length === 0 ? (
        <p className="pt-2 text-base text-secondary/70">Not available.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {activeSizes.map((sizeOption) => {
            const size = sizeOption.size || "No size";
            const sizeLabel = formatSizeLabel(size);
            const isSelected = selectedSize === sizeOption.size;
            const isAvailable = sizeOption.stock > 0;
            return (
              <button
                key={`${selectedVariant._id ?? selectedVariant.color}-${size}-${sizeOption.stock}`}
                onClick={() => isAvailable && handleSizeSelect(sizeOption.size)}
                disabled={!isAvailable}
                aria-label={`Size ${sizeLabel}${isAvailable ? "" : ", sold out"}`}
                aria-pressed={isSelected && isAvailable}
                className={`min-w-[4rem] rounded-lg px-4 py-2.5 text-base font-semibold transition-all duration-200 ${
                  isAvailable ? "cursor-pointer active:scale-95" : "cursor-not-allowed"
                } ${
                  isSelected && isAvailable
                    ? "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/30"
                    : ""
                } ${
                  !isSelected && isAvailable
                    ? "bg-muted text-primary hover:-translate-y-0.5 hover:bg-muted/60"
                    : ""
                } ${!isAvailable ? "bg-muted/50 text-secondary/50" : ""}`}
              >
                {sizeLabel}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const stockBlock = selectedVariant && selectedSize && (
    <div className="space-y-1">
      <p className="text-base font-semibold text-primary">Stock availability</p>
      <p className="text-base text-secondary/70">
        {selectedSizeStock && selectedSizeStock > 0 ? `${selectedSizeStock} piece(s) available` : "Not available"}
      </p>
    </div>
  );

  // ─── Section 2: description, facts, size chart ───────────────────────────

  const descriptionBlock = (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold text-primary md:text-4xl">Product description</h2>
      <p className="max-w-3xl text-lg leading-7 text-secondary/70">
        {currentOutfit?.description || "No description available yet."}
      </p>
    </div>
  );

  const specBlock = (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold text-primary md:text-4xl">Product Specification</h2>
      <dl className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-base text-secondary/70">Category</dt>
          <dd className="text-base font-semibold text-primary">
            {currentOutfit?.category || "Not specified"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-base text-secondary/70">Total stock</dt>
          <dd className="text-base font-semibold text-primary">
            {totalStock > 0 ? totalStock : "Not available"}
          </dd>
        </div>
        {currentOutfit?.fabricType && (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-base text-secondary/70">Material</dt>
            <dd className="text-base font-semibold text-primary">{currentOutfit.fabricType}</dd>
          </div>
        )}
      </dl>
    </div>
  );

  // Rows are separated by space, not lines; the selected size is highlighted.
  const sizeChartBlock = chartRows.length > 0 && (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold text-primary md:text-4xl">Size chart</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2 text-left">
          <thead>
            <tr className="text-sm text-secondary/70">
              <th className="px-4 py-1 font-medium">Size</th>
              {chartColumns.map((key) => (
                <th key={key} className="px-4 py-1 font-medium">
                  {MEASUREMENT_LABELS[key] ?? key} (in)
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chartRows.map((row) => {
              const isSelectedRow = selectedSize === row.size;
              return (
                <tr
                  key={row.size}
                  className={`transition-colors ${
                    isSelectedRow ? "bg-secondary text-secondary-foreground" : "bg-muted text-primary"
                  }`}
                >
                  <td className="rounded-l-xl px-4 py-3 font-semibold">{formatSizeLabel(row.size)}</td>
                  {chartColumns.map((key, index) => (
                    <td
                      key={key}
                      className={`px-4 py-3 tabular-nums ${
                        index === chartColumns.length - 1 ? "rounded-r-xl" : ""
                      }`}
                    >
                      {row.values[key] ?? "0"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-28">
      <Link
        href="/dashboard/browse"
        className="inline-flex cursor-pointer items-center gap-1 text-base text-secondary/70 hover:text-primary"
      >
        <ChevronLeft className="size-4 text-primary" /> Back to browse
      </Link>

      {/* Section 1: image + product information */}
      <Reveal className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] xl:gap-12">
        <section className="min-w-0">{imageBlock}</section>

        <section className="flex flex-col rounded-2xl bg-background p-5 shadow-sm sm:p-6">
          {nameBlock}
          <div className="pt-7">{statsBlock}</div>
          <div className="pt-7">{priceBlock}</div>
          <div className="pt-7">{colorsBlock}</div>
          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
              selectedVariant ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
          >
            <div className="overflow-hidden">
              <div className="pt-7">{sizesBlock}</div>
            </div>
          </div>
          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
              selectedSize ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
          >
            <div className="overflow-hidden">
              <div className="pt-7">{stockBlock}</div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Section 2: description, specification, then the size chart */}
      <Reveal className="flex flex-col gap-8 pt-4" delay={0.05}>
        <section className="rounded-2xl bg-background p-5 shadow-sm sm:p-6">
          {descriptionBlock}
        </section>
        <section className="rounded-2xl bg-background p-5 shadow-sm sm:p-6">
          {specBlock}
        </section>
        {sizeChartBlock && (
          <section className="rounded-2xl bg-background p-5 shadow-sm sm:p-6">
            {sizeChartBlock}
          </section>
        )}
      </Reveal>

      {/* Sticky action bar on all screens */}
      <motion.div
        initial={{opacity: 0, y: 48}}
        animate={{opacity: 1, y: 0}}
        transition={{type: "spring", stiffness: 260, damping: 28, delay: 0.1}}
        className="fixed inset-x-0 bottom-[-32] z-40 bg-background"
      >
        <div className="mx-auto flex w-full max-w-7xl min-w-0 items-center gap-2 px-4 py-3 sm:justify-end md:px-8">
          {canTryInAR && (
            <Button
              onClick={() => setARDisplay(true)}
              variant="outline"
              size="lg"
              className="min-w-0 flex-1 cursor-pointer whitespace-nowrap sm:flex-none sm:px-6"
            >
              <ScanFace aria-hidden className="size-5 text-secondary" />
              Try in AR
            </Button>
          )}
          <Button
            onClick={handleAddToCart}
            className="min-w-0 flex-1 cursor-pointer whitespace-nowrap sm:flex-none sm:px-6"
            size="lg"
            disabled={!canAddToCart || loading}
          >
            {loading ? "Loading..." : "Add to Cart"}
          </Button>
        </div>
      </motion.div>

      {isARDisplayed && canTryInAR && arModelUrl && (
        <AR
          modelUrl={arModelUrl}
          sizes={arSizes}
          sizeMeasurements={sizeMeasurements}
          category={currentOutfit?.category}
          onClose={setARDisplay}
        />
      )}

      <ReviewsSection reviews={outfitReviews} isLoading={isReviewsLoading} />
    </div>
  );
}
