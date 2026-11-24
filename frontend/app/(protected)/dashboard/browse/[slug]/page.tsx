"use client";

import {Palette as EmptyIcon} from "lucide-react";
import {EmptyState} from "@/components/ui/empty-state";
import {AlertDialogComponent} from "@/components/AlertDialog";
import Image from "next/image";
import Link from "next/link";
import {useState} from "react";
import {useParams} from "next/navigation";
import {motion} from "framer-motion";
import {Portal} from "radix-ui";
import {ChevronLeft, MessageSquare, ScanFace, Star} from "lucide-react";

import {Reveal, staggerContainer, staggerItem} from "@/components/motion";

import {UserAvatar} from "@/components/UserAvatar";
import {Button} from "@/components/ui/button";
import {useNotification} from "@/components/ui/alert";
import {IOutfit, Variant} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {
  getColorValue,
  getOutfitBranchLabel,
  normalizeOutfitBranch,
} from "@/features/admin-dashboard/inventory-tab/constants/constants";
import {compareSizes, formatSizeLabel} from "@/lib/size";
import {
  fetchOutfitById,
  fetchOutfitSoldCount,
  fetchOutfitRentedCount,
} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {addToCartService} from "@/features/user-dashboard/cart/services/cartService";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {ICartItem} from "@/features/user-dashboard/cart/types/ICart";
import {getReviewsByOutfitId} from "@/features/user-dashboard/review/services/reviewService";
import {StarRating} from "@/features/user-dashboard/review/components/StarRating";
import {IReview} from "@/features/user-dashboard/review/types/IReview";
import {formatReadableDate} from "@/lib/formatters";
import {AR} from "@/features/user-dashboard/AR";
import {getOutfitArFit} from "@/features/user-dashboard/browse-tab/utils/outfitAr";
import {BrowseOutfitSkeleton} from "@/features/user-dashboard/browse-tab/components/Skeleton";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {
  isObjectId,
  isOutfitReference,
  normalizeReference,
} from "@/lib/reference-path";
import {MEASUREMENT_LABELS} from "@/lib/measurements";

import {NotFoundView} from "@/features/reusable/NotFoundView";
import {OutfitBranchBadge} from "@/features/reusable/OutfitBranchBadge";

function formatPrice(value?: number | string) {
  return `₱${Number(value ?? 0).toLocaleString()}`;
}

function findDefaultVariant(variants: Variant[]) {
  return (
    variants.find((variant) =>
      (variant.sizes ?? []).some((size) => (size.stock ?? 0) > 0),
    ) ?? variants[0]
  );
}

function findDefaultSize(variant?: Variant) {
  const sizes = [...(variant?.sizes ?? [])].sort((a, b) =>
    compareSizes(a.size, b.size),
  );

  return (sizes.find((size) => (size.stock ?? 0) > 0) ?? sizes[0])?.size;
}

// ─── Rating breakdown bar ───────────────────────────────────────────────────

function RatingBar({star, count, total}: {star: number; count: number; total: number}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-base">
      <span className="w-3 text-right text-muted-foreground">{star}</span>
      <Star className="size-3 shrink-0 fill-accent text-accent" />
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-accent transition-all duration-500" style={{width: `${pct}%`}} />
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
              <p className="mt-1 text-base text-muted-foreground">
                {review.createdAt
                  ? formatReadableDate(review.createdAt)
                  : "Customer review"}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <StarRating value={review.stars} />
              <span className="text-base font-medium tabular-nums text-secondary">
                {review.stars}
              </span>
            </div>
          </div>

          <p className="mt-3 text-base leading-relaxed text-secondary">
            {review.comment || (
              <span className="text-muted-foreground italic">
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
    <section className="mt-6">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold text-primary md:text-2xl">
          Customer reviews
        </h2>

        {total > 0 && (
          <div className="mt-6 grid gap-5 pb-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-10">
            <div className="flex flex-col items-center justify-center gap-1.5">
              <span className="text-3xl font-semibold tabular-nums text-secondary">
                {average.toFixed(1).replace(/\.0$/, "")}
              </span>
              <StarRating value={average} size="md" />
              <span className="mt-0.5 text-base text-muted-foreground">
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
          <EmptyState icon={MessageSquare} title="No reviews yet" className="min-h-0" />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{once: true, amount: 0.1}}
            className="space-y-5"
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
  const [imageDimensions, setImageDimensions] = useState({
    width: 600,
    height: 800,
  });
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
  const {data: rentedCount, isLoading: isRentedLoading} = useQuery({
    queryKey: ["outfit-rented", outfitID],
    queryFn: () => fetchOutfitRentedCount(outfitID),
    enabled: Boolean(outfitID),
  });

  const variants = Array.isArray(currentOutfit?.variants) ? currentOutfit.variants : [];
  const activeVariant =
    (selectedVariant &&
      variants.find(
        (variant) =>
          variant === selectedVariant ||
          (variant._id && variant._id === selectedVariant._id),
      )) ||
    findDefaultVariant(variants);
  const activeVariantSizes = [...(activeVariant?.sizes ?? [])].sort((a, b) =>
    compareSizes(a.size, b.size),
  );
  const activeSize =
    activeVariantSizes.find((sizeOption) => sizeOption.size === selectedSize)
      ?.size ?? findDefaultSize(activeVariant);
  const activeSizeData = activeVariantSizes.find(
    (sizeOption) => sizeOption.size === activeSize,
  );
  const activeSizeStock = activeSizeData?.stock ?? null;
  const hasVariants = variants.length > 0;
  const canAddToCart =
    Boolean(activeVariant) && Boolean(activeSize) && activeSizeStock !== null && activeSizeStock > 0;

  const handleColorSelect = (variant: Variant) => {
    setSelectedVariant(variant);
    setSelectedSize(findDefaultSize(variant));
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
    if (!activeVariant || !activeSize) {
      notify({
        title: "Select a variant",
        description: "Please select a color and size first.",
        variant: "warning",
      });
      return;
    }

    if (activeVariant.sizes?.find((s) => s.size === activeSize)?.stock === 0) {
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
          variantId: activeVariant?._id || "",
          size: activeSize || "",
          color: activeVariant?.color || "",
          quantity: 1,
          name: currentOutfit?.name || "",
          category: currentOutfit?.category || "",
          branch: normalizeOutfitBranch(currentOutfit?.branch),
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
        open
        title="Outfit not found"
        description="This outfit reference is invalid or no longer available. Browse the collection to find another outfit."
      />
    );
  }

  if (isOutfitLoading && !currentOutfit) return <BrowseOutfitSkeleton />;

  if (!currentOutfit) {
    return (
      <NotFoundView
        open
        title="Outfit not found"
        description="This outfit may have been removed or is no longer available."
      />
    );
  }

  const outfitImage =
    typeof currentOutfit.imageURL === "string" ? currentOutfit.imageURL : "/assets/images/landing-page/suit.jpg";

  const {arModelUrl, arSizes, sizeMeasurements, canTryInAR} = getOutfitArFit(currentOutfit);

  const totalStock = variants.reduce(
    (total, variant) =>
      total +
      (variant.sizes ?? []).reduce((variantTotal, size) => variantTotal + (size.stock ?? 0), 0),
    0,
  );

  // ─── Reusable blocks (defined once, rendered in different orders below) ──

  const imageBlock = (
    <div className="flex h-[calc(100svh-13.5rem)] min-h-[18rem] w-full justify-center xl:w-auto xl:justify-start">
      <Image
        src={outfitImage}
        alt={currentOutfit?.name || "Outfit"}
        width={imageDimensions.width}
        height={imageDimensions.height}
        onLoad={(event) => {
          const {naturalWidth, naturalHeight} = event.currentTarget;
          if (naturalWidth > 0 && naturalHeight > 0) {
            setImageDimensions((current) =>
              current.width === naturalWidth && current.height === naturalHeight
                ? current
                : {width: naturalWidth, height: naturalHeight},
            );
          }
        }}
        className="h-full w-auto max-w-full rounded-2xl bg-background object-contain shadow-sm"
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
    <div className="space-y-3">
      <OutfitBranchBadge branch={currentOutfit?.branch} />
      <h1 className="text-2xl font-semibold tracking-tight text-primary md:text-3xl">
        {currentOutfit?.name || "Outfit name not available"}
      </h1>
    </div>
  );

  const statsBlock = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-base text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <StarRating value={averageRating ?? 0} size="sm" />
        <span className="font-medium tabular-nums text-secondary">
          {averageRating !== null ? averageRating.toFixed(1).replace(/\.0$/, "") : "0"}
        </span>
      </span>
      <span aria-hidden="true">|</span>
      <span className="tabular-nums">
        {reviewCountLabel} {reviewCount === 1 ? "review" : "reviews"}
      </span>
      <span aria-hidden="true">|</span>
      <span className="tabular-nums">{soldCountLabel} sold</span>
      <span aria-hidden="true">|</span>
      <span className="tabular-nums">
        {isRentedLoading || rentedCount === undefined ? "–" : rentedCount.toLocaleString()} rented
      </span>
    </div>
  );

  // Keep rental and purchase prices together in matching navy cards.
  const priceBlock = (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {currentOutfit?.rentalPrice ? (
        <div className="min-w-0 space-y-2 rounded-lg bg-secondary p-5">
          <dt className="text-base text-secondary-foreground/80">Rental</dt>
          <dd className="text-2xl font-semibold tabular-nums text-secondary-foreground">
            {formatPrice(currentOutfit.rentalPrice)}
          </dd>
        </div>
      ) : null}

      {currentOutfit?.price ? (
        <div className="min-w-0 space-y-2 rounded-lg bg-secondary p-5">
          <dt className="text-base text-secondary-foreground/80">Purchase</dt>
          <dd className="text-2xl font-semibold tabular-nums text-secondary-foreground">
            {formatPrice(currentOutfit.price)}
          </dd>
        </div>
      ) : null}
    </dl>
  );

  // Row layout: label on the left, choices on the right
  const colorsBlock = (
    <div className="grid grid-cols-[7.5rem_1fr] items-center gap-4">
      <div>
        <p className="text-base font-semibold text-primary">Pick a color</p>
      </div>
      {hasVariants ? (
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => {
            const color = variant.color || "Unnamed color";
            const isActive = activeVariant?._id === variant._id;
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
        <EmptyState icon={EmptyIcon} title="No color variants available" className="min-h-0 py-6" />
      )}
    </div>
  );

  const sizesBlock = (
    <div className="grid grid-cols-[7.5rem_1fr] items-start gap-4">
      <p className="pt-2 text-base font-semibold text-primary">Pick a size</p>
      {activeVariantSizes.length === 0 ? (
        <p className="pt-2 text-base text-muted-foreground">Not available.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {activeVariantSizes.map((sizeOption) => {
            const size = sizeOption.size || "No size";
            const sizeLabel = formatSizeLabel(size);
            const isSelected = activeSize === sizeOption.size;
            const isAvailable = sizeOption.stock > 0;
            return (
              <button
                key={`${activeVariant?._id ?? activeVariant?.color ?? "variant"}-${size}-${sizeOption.stock}`}
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
                      ? "bg-background text-secondary hover:-translate-y-0.5 hover:bg-muted-foreground/15"
                    : ""
                } ${!isAvailable ? "bg-muted/50 text-muted-foreground" : ""}`}
              >
                {sizeLabel}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const stockBlock = (
    <div className="space-y-1">
      <p className="text-base font-semibold text-primary">Stock availability</p>
      <p className="text-base font-medium text-secondary">
        {activeSizeStock && activeSizeStock > 0 ? `${activeSizeStock} piece(s) available` : "Not available"}
      </p>
    </div>
  );

  // ─── Section 2: description, facts, size chart ───────────────────────────

  const descriptionBlock = (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-primary md:text-2xl">Product description</h2>
      <p className="max-w-3xl text-base leading-relaxed text-secondary">
        {currentOutfit?.description || "No description available yet."}
      </p>
    </div>
  );

  const specBlock = (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-primary md:text-2xl">Product specifications</h2>
      <dl className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-base text-muted-foreground">Category</dt>
          <dd className="text-base font-medium text-secondary">
            {currentOutfit?.category || "Not specified"}
          </dd>
        </div>
        {getOutfitBranchLabel(currentOutfit?.branch) && (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-base text-muted-foreground">Branch</dt>
            <dd className="text-base font-medium text-secondary">
              {getOutfitBranchLabel(currentOutfit?.branch)}
            </dd>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <dt className="text-base text-muted-foreground">Total stock</dt>
          <dd className="text-base font-medium text-secondary">
            {totalStock > 0 ? totalStock : "Not available"}
          </dd>
        </div>
        {currentOutfit?.fabricType && (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-base text-muted-foreground">Material</dt>
            <dd className="text-base font-medium text-secondary">{currentOutfit.fabricType}</dd>
          </div>
        )}
      </dl>
    </div>
  );

  // Rows are separated by space, not lines; the selected size is highlighted.
  const sizeChartBlock = chartRows.length > 0 && (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-primary md:text-2xl">Size chart</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2 text-left">
          <thead>
            <tr className="text-sm text-muted-foreground">
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
              const isSelectedRow = activeSize === row.size;
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
    <div className="space-y-8 pb-28 md:space-y-12">
      <Link
        href="/dashboard/browse"
        className="inline-flex cursor-pointer items-center gap-1 text-base text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="size-4 text-primary" /> Back to browse
      </Link>

      {/* Section 1: image + product information */}
      <Reveal className="flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-12">
        <section className="min-w-0 xl:shrink-0">{imageBlock}</section>

        <section className="flex min-w-0 flex-1 flex-col xl:min-w-[22rem]">
          {nameBlock}
          <div className="pt-7">{statsBlock}</div>
          <div className="pt-6">{priceBlock}</div>
          <div className="pt-6">{colorsBlock}</div>
          <div className="pt-6">{sizesBlock}</div>
          <div className="pt-6">{stockBlock}</div>
        </section>
      </Reveal>

      {/* Section 2: description, specification, then the size chart */}
      <Reveal className="flex flex-col gap-8 md:gap-12" delay={0.05}>
        <section className="min-w-0">
          {descriptionBlock}
        </section>
        <section className="min-w-0">
          {specBlock}
        </section>
        {sizeChartBlock && (
          <section className="min-w-0">
            {sizeChartBlock}
          </section>
        )}
      </Reveal>

      <Portal.Root asChild>
        <div className="fixed inset-x-0 bottom-0 z-40 bg-background pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto flex w-full max-w-7xl min-w-0 items-center gap-2 px-4 py-3 sm:justify-end md:px-8">
            {canTryInAR && (
              <AlertDialogComponent
                action={() => setARDisplay(true)}
                title="Try this outfit in AR?"
                description="Open the virtual try-on for this outfit."
                actionLabel="Try in AR"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="min-w-0 flex-1 cursor-pointer whitespace-nowrap sm:flex-none sm:px-6"
                >
                  <ScanFace aria-hidden className="size-5 text-secondary" />
                  Try in AR
                </Button>
              </AlertDialogComponent>
            )}
            <AlertDialogComponent
              action={handleAddToCart}
              title="Add this outfit to your cart?"
              description="Add the selected size, color, and quantity to your cart."
              actionLabel="Add to cart"
            >
              <Button
                className="min-w-0 flex-1 cursor-pointer whitespace-nowrap sm:flex-none sm:px-6"
                size="lg"
                disabled={!canAddToCart || loading}
              >
                {loading ? "Loading..." : "Add to Cart"}
              </Button>
            </AlertDialogComponent>
          </div>
        </div>
      </Portal.Root>

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
