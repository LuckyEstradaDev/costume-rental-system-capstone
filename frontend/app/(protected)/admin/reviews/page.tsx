"use client";

import {useMemo, useState} from "react";
import type {ReactNode} from "react";
import {MessageSquare, SlidersHorizontal, Star as StarIcon} from "lucide-react";

import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {StatCard} from "@/components/ui/stat-card";
import {Quotes, Star, TShirt} from "@/components/ui/stat-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {formatReadableDate} from "@/lib/formatters";
import {fetchOutfitsService} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {getAllReviewsService} from "@/features/admin-dashboard/reviews-tab/services/reviewService";
import {useDateWindow} from "@/features/admin-dashboard/dashboard/hooks/useDateWindow";
import {AdminEmptyState} from "@/features/admin-dashboard/components/AdminEmptyState";
import {AdminPageHeader, AdminPageTitle} from "@/features/admin-dashboard/components/AdminPageHeader";
import {AdminSearchInput} from "@/features/admin-dashboard/components/AdminSearchInput";
import {AdminSegmented} from "@/features/admin-dashboard/components/AdminSegmented";
import {DateRangeSlicer} from "@/features/admin-dashboard/dashboard/components/slicers/DateRangeSlicer";
import {isWithinRange} from "@/features/admin-dashboard/dashboard/utils/dateRange";
import {IReview} from "@/features/user-dashboard/review/types/IReview";
import {useQuery} from "@tanstack/react-query";

type OutfitItem = {
  _id?: string;
  name: string;
};

type OutfitReviewData = {
  outfit: OutfitItem;
  reviews: IReview[];
  averageRating: number;
};

type ReviewRow = {
  outfit: OutfitItem;
  review: IReview;
  averageRating: number;
  groupSize: number;
  groupIndex: number;
  firstInGroup: boolean;
};

type RatingFilter = "all" | "1" | "2" | "3" | "4" | "5";

const RATING_FILTER_OPTIONS = [
  {value: "all", label: "All"},
  {value: "5", label: "5 ★"},
  {value: "4", label: "4 ★"},
  {value: "3", label: "3 ★"},
  {value: "2", label: "2 ★"},
  {value: "1", label: "1 ★"},
] as const;

function SectionHeading({children}: {children: ReactNode}) {
  return (
    <h2 className="text-xl font-semibold text-primary md:text-2xl">
      {children}
    </h2>
  );
}

// Header cells: sentence case in the muted tone, not tracked uppercase.
const HEAD_CLASS = "text-sm font-medium text-muted-foreground";

export default function AdminReviewsPage() {
  //fetchers
  const reviewsData = useQuery({
    queryKey: ["outfit-reviews"],
    queryFn: getAllReviewsService,
  });

  const outfitsData = useQuery({
    queryKey: ["outfits"],
    queryFn: fetchOutfitsService,
  });

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const dateWindow = useDateWindow();

  const isLoading = reviewsData.isLoading || outfitsData.isLoading;
  const error =
    reviewsData.error || outfitsData.error
      ? "Unable to load outfit reviews."
      : "";

  // Grouping is pure derivation over already-fetched rows, so it belongs in a
  // memo rather than an effect. The window is applied *before* grouping, which
  // keeps each outfit's review count and average rating describing exactly the
  // rows listed underneath it.
  const outfitReviews = useMemo<OutfitReviewData[]>(() => {
    const outfits = (outfitsData.data ?? []) as OutfitItem[];
    const reviews = ((reviewsData.data ?? []) as IReview[]).filter((review) =>
      isWithinRange(review.createdAt, dateWindow.range),
    );

    return outfits.flatMap((outfit) => {
      const matching = outfit._id
        ? reviews.filter((review) => review.outfitID === outfit._id)
        : [];

      if (matching.length === 0) {
        return [];
      }

      const averageRating =
        matching.reduce((sum, review) => sum + (review.stars ?? 0), 0) /
        matching.length;

      return [{outfit, reviews: matching, averageRating}];
    });
  }, [outfitsData.data, reviewsData.data, dateWindow.range]);

  const filteredOutfitReviews = useMemo<OutfitReviewData[]>(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const rating = ratingFilter === "all" ? null : Number(ratingFilter);

    return outfitReviews
      .map(({outfit, reviews}) => {
        const matching = reviews.filter(
          (review) => rating === null || review.stars === rating,
        );

        return {
          outfit,
          reviews: matching,
          averageRating:
            matching.length === 0
              ? 0
              : matching.reduce(
                  (sum, review) => sum + (review.stars ?? 0),
                  0,
                ) / matching.length,
        };
      })
      .filter(({outfit, reviews}) => {
        if (reviews.length === 0) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const outfitName = outfit.name.toLowerCase();
        const matchesOutfit = outfitName.includes(normalizedSearch);
        const matchesReview = reviews.some((review) =>
          // The name is what the table shows, so it has to be searchable even
          // though only the raw id is guaranteed to be present.
          [review.userSnapshot?.fullname, review.userID, review.comment]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(normalizedSearch)),
        );

        return matchesOutfit || matchesReview;
      });
  }, [outfitReviews, search, ratingFilter]);

  const hasActiveFilters = search.trim() !== "" || ratingFilter !== "all";
  const totalReviews = outfitReviews.reduce(
    (sum, {reviews}) => sum + reviews.length,
    0,
  );
  const clearFilters = () => {
    setSearch("");
    setRatingFilter("all");
  };

  // Derived from `filteredOutfitReviews` - the same array the table below renders
  // - so the totals and the rows can never disagree. That is also why the totals
  // move as you type: the search narrows the list, and the summary describes the
  // list, not the raw query.
  //
  // The average is weighted across reviews rather than averaging the per-outfit
  // averages already computed above. Averaging those would give an outfit with
  // one 5-star review the same say as one with fifty.
  const reviewStats = useMemo(() => {
    const all = filteredOutfitReviews.flatMap(({reviews}) => reviews);
    const total = all.length;
    const totalStars = all.reduce((sum, review) => sum + (review.stars ?? 0), 0);

    return {
      total,
      // `null` rather than 0 so the card can show an em dash; "0.0" would read
      // as a real, terrible rating instead of an absence of ratings.
      averageRating: total === 0 ? null : totalStars / total,
      withComment: all.filter(
        (review) => review.comment && review.comment.trim().length > 0,
      ).length,
      outfits: filteredOutfitReviews.length,
    };
  }, [filteredOutfitReviews]);

  const reviewRows = useMemo<ReviewRow[]>(
    () =>
      filteredOutfitReviews.flatMap(
        ({outfit, reviews, averageRating}, groupIndex) =>
          reviews.map((review, index) => ({
            outfit,
            review,
            averageRating,
            groupSize: reviews.length,
            groupIndex,
            firstInGroup: index === 0,
          })),
      ),
    [filteredOutfitReviews],
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={
          <AdminPageTitle icon={MessageSquare}>Outfit Reviews</AdminPageTitle>
        }
        description="What customers are saying about each outfit."
      />
      <DateRangeSlicer
        presetId={dateWindow.presetId}
        range={dateWindow.range}
        customFrom={dateWindow.customFrom}
        customTo={dateWindow.customTo}
        isDefault={dateWindow.isDefault}
        defaultPreset="all"
        onPresetChange={dateWindow.setPreset}
        onCustomFromChange={dateWindow.setCustomFromValue}
        onCustomToChange={dateWindow.setCustomToValue}
        onReset={dateWindow.resetAll}
      />

      <section className="space-y-4">
        <SectionHeading>Overview</SectionHeading>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4">
          <StatCard
            label="Average rating"
            context="Across the reviews listed"
            icon={<Star />}
            isLoading={isLoading}
            value={
              reviewStats.averageRating === null
                ? "-"
                : reviewStats.averageRating.toFixed(1)
            }
          />
          <StatCard
            label="With comment"
            context="Include written feedback"
            icon={<Quotes />}
            isLoading={isLoading}
            value={reviewStats.withComment}
          />
          <StatCard
            label="Outfits reviewed"
            context="With at least one review"
            icon={<TShirt />}
            isLoading={isLoading}
            value={reviewStats.outfits}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <SectionHeading>All reviews</SectionHeading>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AdminSearchInput
              value={search}
              onValueChange={setSearch}
              placeholder="Search reviews…"
              wrapperClassName="w-full md:w-56"
              className="h-8"
            />
            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2"
                >
                  <SlidersHorizontal className="size-3.5" />
                  Filters
                  {ratingFilter !== "all" ? (
                    <span className="size-1.5 rounded-full bg-primary" />
                  ) : null}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 space-y-3 p-3">
                <p className="text-xs font-semibold text-muted-foreground">
                  Rating
                </p>
                <AdminSegmented
                  size="sm"
                  variant="pills"
                  aria-label="Review rating"
                  value={ratingFilter}
                  onValueChange={setRatingFilter}
                  options={RATING_FILTER_OPTIONS}
                  className="flex-wrap"
                />
                {hasActiveFilters ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      clearFilters();
                      setFiltersOpen(false);
                    }}
                  >
                    Clear filters
                  </Button>
                ) : null}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {/* Loading is its own plain card and the empty is the shared
            full-height state. */}
        {isLoading ? (
          <Card className="rounded-lg border-0 bg-muted p-6 text-sm text-muted-foreground ring-0">
            Loading reviews...
          </Card>
        ) : filteredOutfitReviews.length === 0 ? (
          <AdminEmptyState
            icon={MessageSquare}
            title="No reviews to show"
            description={
              hasActiveFilters
                ? "No reviews match these filters. Try a different name, rating, or clear the filters to see everything in this date range."
                : "Reviews will appear here as customers rate an outfit they have rented or bought."
            }
            action={
              hasActiveFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              ) : null
            }
          />
        ) : (
          // Cream surface with no ring, header rule, or row lines. Groups are
          // separated by extra padding on the first row of each outfit.
          <Card className="overflow-hidden rounded-lg border-0 bg-muted p-0 ring-0">
            <Table className="min-w-[820px] table-fixed">
              <TableHeader className="[&_tr]:border-0">
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className={`w-[24%] ${HEAD_CLASS}`}>
                    Outfit
                  </TableHead>
                  <TableHead className={`w-[20%] ${HEAD_CLASS}`}>
                    Reviewer
                  </TableHead>
                  <TableHead className={`w-[10%] text-center ${HEAD_CLASS}`}>
                    Rating
                  </TableHead>
                  <TableHead className={`w-[30%] ${HEAD_CLASS}`}>
                    Comment
                  </TableHead>
                  <TableHead className={`w-[16%] ${HEAD_CLASS}`}>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr]:border-0">
                {reviewRows.map((row, rowIndex) => (
                  <TableRow
                    key={
                      row.review._id ??
                      `${row.outfit._id ?? row.outfit.name}-${row.review.userID}-${row.groupIndex}-${rowIndex}`
                    }
                    className={`border-0 transition-colors hover:bg-background/60 ${
                      row.groupIndex > 0 && row.firstInGroup
                        ? "[&>td]:pt-6"
                        : ""
                    }`}
                  >
                    {row.firstInGroup ? (
                      <TableCell rowSpan={row.groupSize} className="align-top">
                        <p className="truncate font-semibold text-primary">
                          {row.outfit.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {row.groupSize} review{row.groupSize === 1 ? "" : "s"}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <StarIcon className="size-3 fill-accent text-accent" />
                          <span className="font-medium tabular-nums text-primary">
                            {row.averageRating.toFixed(1)}
                          </span>
                          <span>/ 5</span>
                        </p>
                      </TableCell>
                    ) : null}
                    <TableCell className="truncate text-sm font-medium text-primary">
                      {row.review.userSnapshot?.fullname ?? row.review.userID}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1.5">
                        <StarIcon className="size-3.5 fill-accent text-accent" />
                        <span className="text-sm font-semibold tabular-nums text-primary">
                          {row.review.stars}
                        </span>
                        <span className="text-xs text-muted-foreground">/ 5</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-sm leading-relaxed text-foreground/80">
                      {row.review.comment ? (
                        <span className="line-clamp-2">{row.review.comment}</span>
                      ) : (
                        <span className="italic text-muted-foreground/50">
                          No comment
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap tabular-nums text-muted-foreground">
                      {row.review.createdAt
                        ? formatReadableDate(new Date(row.review.createdAt))
                        : "Unknown"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </section>
    </div>
  );
}