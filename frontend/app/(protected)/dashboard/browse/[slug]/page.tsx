"use client";

import Image from "next/image";
import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import {
  CalendarClock,
  Package,
  Palette,
  Ruler,
  Star,
  Shirt,
  ArrowLeftRight,
  ArrowUpDown,
  MessageSquare,
} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {useNotification} from "@/components/ui/alert";
import {
  IOutfit,
  Variant,
} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {fetchOutfitById} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {addToCartService} from "@/features/user-dashboard/cart/services/cartService";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {ICartItem} from "@/features/user-dashboard/cart/types/ICart";
import {getReviewsByOutfitId} from "@/features/user-dashboard/review/services/reviewService";
import {IReview} from "@/features/user-dashboard/review/types/IReview";
import {formatReadableDateTime} from "@/lib/formatters";
import {AR} from "@/features/user-dashboard/browse-tab/components/AR";
import {BrowseOutfitSkeleton} from "@/features/user-dashboard/browse-tab/components/Skeleton";

// ─── Star rating display ────────────────────────────────────────────────────

function StarRating({
  value,
  max = 5,
  size = "sm",
}: {
  value: number;
  max?: number;
  size?: "sm" | "md";
}) {
  const px = size === "md" ? "size-4" : "size-3.5";
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${value} out of ${max} stars`}
    >
      {Array.from({length: max}).map((_, i) => (
        <Star
          key={i}
          className={`${px} ${
            i < Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Rating breakdown bar ───────────────────────────────────────────────────

function RatingBar({
  star,
  count,
  total,
}: {
  star: number;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-3 text-right text-muted-foreground">{star}</span>
      <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" />
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{width: `${pct}%`}}
        />
      </div>
      <span className="w-5 text-right text-muted-foreground">{count}</span>
    </div>
  );
}

// ─── Single review card ─────────────────────────────────────────────────────

function ReviewItem({review, index}: {review: IReview; index: number}) {
  const initials = review.userSnapshot?.fullname
    ? review.userSnapshot.fullname
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : `C${index + 1}`;

  // Cycle through a small set of soft hues for the avatar background
  const hues = [
    "bg-violet-100 text-violet-700",
    "bg-sky-100 text-sky-700",
    "bg-rose-100 text-rose-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
  ];
  const avatarClass = hues[index % hues.length];

  return (
    <div className="group relative rounded-2xl border bg-background p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${avatarClass}`}
        >
          {initials}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <div>
              <p className="text-sm font-semibold leading-tight">
                {review.userSnapshot?.fullname}
              </p>
              {review.createdAt && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatReadableDateTime(review.createdAt)}
                </p>
              )}
            </div>
            <StarRating value={review.stars} />
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {review.comment || "No written comment."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Reviews section ────────────────────────────────────────────────────────

function ReviewsSection({
  reviews,
  isLoading,
}: {
  reviews: IReview[];
  isLoading: boolean;
}) {
  const total = reviews.length;
  const average = total ? reviews.reduce((s, r) => s + r.stars, 0) / total : 0;

  // Count per star rating 1–5
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.stars === star).length,
  }));

  return (
    <section className="mt-10">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="size-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Customer Reviews</h2>
        {total > 0 && (
          <Badge variant="secondary" className="rounded-full">
            {total}
          </Badge>
        )}
      </div>

      {/* Summary + distribution */}
      {total > 0 && (
        <div className="mb-8 grid gap-6 rounded-2xl border bg-muted/20 p-6 sm:grid-cols-[auto_1fr]">
          {/* Score */}
          <div className="flex flex-col items-center justify-center gap-1 sm:pr-6 sm:border-r">
            <span className="text-5xl font-bold tracking-tight text-foreground">
              {average.toFixed(1)}
            </span>
            <StarRating value={Math.round(average)} size="md" />
            <span className="text-xs text-muted-foreground mt-1">
              Based on {total} {total === 1 ? "review" : "reviews"}
            </span>
          </div>

          {/* Bar chart */}
          <div className="flex flex-col justify-center gap-2">
            {distribution.map(({star, count}) => (
              <RatingBar key={star} star={star} count={count} total={total} />
            ))}
          </div>
        </div>
      )}

      <Separator className="mb-6" />

      {/* Review list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl border bg-muted/30 animate-pulse"
            />
          ))}
        </div>
      ) : total === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-14 text-center">
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
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function BrowseOutfitPage() {
  const [currentOutfit, setCurrentOutfit] = useState<IOutfit>();
  const [outfitReviews, setOutfitReviews] = useState<IReview[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>();
  const {user} = useAuth();
  const [selectedVariant, setSelectedVariant] = useState<Variant>();
  const [loading, setLoading] = useState(false);
  const [isARDisplayed, setARDisplay] = useState(false);

  const params = useParams<{slug?: string | string[]}>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const {notify} = useNotification();

  const getIdFromSlug = (slug: string) => {
    const slugArray = slug.split("-");
    return slugArray[slugArray.length - 1];
  };

  useEffect(() => {
    if (!slug) return;
    const fetchOutfit = async () => {
      try {
        const {data} = await fetchOutfitById(getIdFromSlug(slug!));
        setCurrentOutfit(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchOutfit();
  }, [slug]);

  useEffect(() => {
    const outfitId = currentOutfit?._id;
    if (!outfitId) return;
    const fetchReviews = async () => {
      setIsReviewsLoading(true);
      try {
        const {data} = await getReviewsByOutfitId(outfitId);
        setOutfitReviews(data);
      } catch (error) {
        console.error(error);
        setOutfitReviews([]);
      }
      setIsReviewsLoading(false);
    };
    fetchReviews();
  }, [currentOutfit?._id]);

  const handleColorSelect = (variant: Variant) => {
    setSelectedVariant(variant);
    setSelectedSize(undefined);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  const handleAddToCart = async () => {
    setLoading(true);
    if (!selectedVariant || !selectedSize) {
      notify({
        title: "Select a variant",
        description: "Please select a color and size first.",
        variant: "warning",
      });
      return;
    }

    if (
      selectedVariant?.sizes.find((s) => s.size === selectedSize)?.stock === 0
    ) {
      notify({
        title: "Out of stock",
        description: "Selected variant and size is out of stock.",
        variant: "error",
      });
      return;
    }

    const cartForm: ICartItem = {
      userId: user?._id || "",
      items: [
        {
          outfitId: currentOutfit?._id || "",
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
        notify({
          title: "Added to cart",
          description: "The outfit has been added to your cart.",
          variant: "success",
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        notify({
          title: "Add failed",
          description: error || "Unable to add this outfit to cart.",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const outfitImage =
    typeof currentOutfit?.imageURL === "string"
      ? currentOutfit.imageURL
      : "/assets/images/landing-page/suit.jpg";

  const totalStock =
    currentOutfit?.variants.reduce(
      (total, variant) =>
        total +
        variant.sizes.reduce(
          (variantTotal, size) => variantTotal + size.stock,
          0,
        ),
      0,
    ) ?? 0;

  const activeSizes = selectedVariant?.sizes ?? [];
  const selectedSizeData = activeSizes.find(
    (size) => size.size === selectedSize,
  );
  const selectedSizeStock = selectedSizeData?.stock ?? null;
  const selectedSizeWidth = selectedSizeData?.width_cm ?? null;
  const selectedSizeHeight = selectedSizeData?.height_cm ?? null;

  const hasVariants = (currentOutfit?.variants.length ?? 0) > 0;
  const buyingPrice = currentOutfit?.price
    ? `PHP ${currentOutfit.price}`
    : "Not set";
  const rentalPrice = currentOutfit?.rentalPrice
    ? `PHP ${currentOutfit.rentalPrice}`
    : "Not set";
  const canAddToCart =
    Boolean(selectedVariant) &&
    Boolean(selectedSize) &&
    selectedSizeStock !== null &&
    selectedSizeStock > 0;

  if (!currentOutfit) return <BrowseOutfitSkeleton />;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] xl:gap-12">
          {/* Left column */}
          <section className="space-y-5">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl border bg-muted sm:aspect-16/11">
              <Image
                src={outfitImage}
                alt={currentOutfit?.name || "Outfit"}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="grid gap-4 border-t pt-5 text-sm sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Category
                </p>
                <p className="font-medium text-foreground">
                  {currentOutfit?.category || "Not specified"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Variants
                </p>
                <p className="font-medium text-foreground">
                  {hasVariants
                    ? currentOutfit?.variants.length
                    : "Not available"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Total Stock
                </p>
                <p className="font-medium text-foreground">
                  {totalStock > 0 ? totalStock : "Not available"}
                </p>
              </div>
            </div>

            {currentOutfit?.fabricType && (
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                  <Shirt className="size-4" />
                  <span className="uppercase tracking-[0.15em] text-xs">
                    Material
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {currentOutfit.fabricType}
                </p>
              </div>
            )}
          </section>

          {/* Right column */}
          <section className="flex flex-col gap-8">
            <div className="space-y-5">
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
                  {currentOutfit?.name || "Outfit name not available"}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                  {currentOutfit?.description ||
                    "No description available yet."}
                </p>
              </div>
            </div>

            <div className="grid gap-4 border-y py-6 sm:grid-cols-2">
              {currentOutfit?.price && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-900">
                    <Package className="size-4" />
                    Buying Price
                  </div>
                  <p className="text-3xl font-semibold text-amber-950">
                    {buyingPrice}
                  </p>
                </div>
              )}
              {currentOutfit?.rentalPrice && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-900">
                    <CalendarClock className="size-4" />
                    Rental Price
                  </div>
                  <p className="text-3xl font-semibold text-emerald-950">
                    {rentalPrice}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Palette className="size-4 text-muted-foreground" />
                  <span>Colors</span>
                </div>
                {hasVariants ? (
                  <div className="flex flex-wrap gap-2">
                    {currentOutfit?.variants.map((variant) => {
                      const color = variant.color || "Unnamed color";
                      const isActive = selectedVariant?._id === variant._id;
                      return (
                        <button
                          key={variant._id ?? color}
                          onClick={() => handleColorSelect(variant)}
                          className={`rounded-full border px-4 py-2 text-sm transition ${
                            isActive
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background hover:border-foreground/40 hover:bg-muted/50"
                          }`}
                        >
                          {color}
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

              {selectedVariant && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Ruler className="size-4 text-muted-foreground" />
                    <span>Sizes</span>
                  </div>
                  {activeSizes.length === 0 ? (
                    <div className="rounded-xl border border-dashed px-4 py-5 text-sm text-muted-foreground">
                      Not available.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {activeSizes.map((sizeOption) => {
                        const size = sizeOption.size || "No size";
                        const isSelected = selectedSize === sizeOption.size;
                        const isAvailable = sizeOption.stock > 0;
                        return (
                          <button
                            key={`${selectedVariant._id ?? selectedVariant.color}-${size}-${sizeOption.stock}`}
                            onClick={() =>
                              isAvailable && handleSizeSelect(sizeOption.size)
                            }
                            disabled={!isAvailable}
                            className={`rounded-md border px-4 py-2 text-sm transition ${
                              isSelected && isAvailable
                                ? "border-primary bg-primary text-primary-foreground"
                                : ""
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
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedVariant && selectedSize && (
              <div className="border-t pt-6 flex justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Stock Availability
                  </p>
                  <p className="text-sm text-foreground">
                    {selectedSizeStock && selectedSizeStock > 0
                      ? `${selectedSizeStock} piece(s) available`
                      : "Not available"}
                  </p>
                </div>
                {(selectedSizeWidth || selectedSizeHeight) && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground mb-3">
                      Dimensions
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {selectedSizeWidth && (
                        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                          <ArrowLeftRight className="size-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Width</span>
                          <span className="font-medium text-foreground">
                            {selectedSizeWidth} cm
                          </span>
                        </div>
                      )}
                      {selectedSizeHeight && (
                        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                          <ArrowUpDown className="size-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Height</span>
                          <span className="font-medium text-foreground">
                            {selectedSizeHeight} cm
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <Button
                onClick={handleAddToCart}
                className="w-full md:w-auto md:min-w-56 cursor-pointer"
                size="lg"
                disabled={!canAddToCart || loading}
              >
                {loading ? "Loading..." : "Add to Cart"}
              </Button>
              <Button
                onClick={() => setARDisplay(true)}
                className="w-full md:w-auto md:min-w-56 cursor-pointer"
                size="lg"
              >
                AR Try-On
              </Button>
            </div>
          </section>

          {isARDisplayed && (
            <AR image={currentOutfit?.imageURL} onClose={setARDisplay} />
          )}
        </div>

        <ReviewsSection reviews={outfitReviews} isLoading={isReviewsLoading} />
      </div>
    </div>
  );
}
