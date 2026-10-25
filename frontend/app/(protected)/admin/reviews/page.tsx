"use client";

import {useMemo, useState} from "react";
import {MessageSquare, Star as StarIcon} from "lucide-react";

import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
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

  const filteredOutfitReviews = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return outfitReviews;
    }

    return outfitReviews.filter(({outfit, reviews}) => {
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
  }, [outfitReviews, search]);

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
    <div className="space-y-6 pt-10">
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

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4">
        <StatCard
          label="Average rating"
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
          icon={<Quotes />}
          isLoading={isLoading}
          value={reviewStats.withComment}
        />
        <StatCard
          label="Outfits reviewed"
          icon={<TShirt />}
          isLoading={isLoading}
          value={reviewStats.outfits}
        />
      </div>

      {/* No heading here: the bar's title already says what this is, and a second
          one directly above the search only repeated it. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <AdminSearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="Search reviews…"
          wrapperClassName="sm:max-w-md"
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {/* Loading is its own plain card and the empty is the shared full-height
          state. They used to be one card branching on `isLoading` internally,
          which meant the empty case was a short strip of grey text rather than
          the same centred placeholder as everywhere else in the admin. */}
      {isLoading ? (
        <Card className="p-6 text-sm text-muted-foreground">Loading reviews...</Card>
      ) : filteredOutfitReviews.length === 0 ? (
        <AdminEmptyState
          icon={MessageSquare}
          title="No reviews to show"
          description={
            search.trim()
              ? "No reviews match your search. Try a different name, or clear the search to see everything in this date range."
              : "Reviews will appear here as customers rate an outfit they have rented or bought."
          }
          action={
            search.trim() ? (
              <Button type="button" variant="outline" size="sm" onClick={() => setSearch("")}>
                Clear search
              </Button>
            ) : null
          }
        />
      ) : (
        <Card className="overflow-hidden border-0 p-0 shadow-sm ring-1 ring-border/60">
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
            <div>
              <h2 className="font-semibold text-foreground">All reviews</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {reviewStats.total}
                </span>{" "}
                total review{reviewStats.total === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <Table className="min-w-[820px] table-fixed">
            <TableHeader>
              <TableRow className="bg-muted/20 hover:bg-muted/20">
                <TableHead className="w-[24%] text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
                  Outfit
                </TableHead>
                <TableHead className="w-[20%] text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
                  Reviewer
                </TableHead>
                <TableHead className="w-[10%] text-center text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
                  Rating
                </TableHead>
                <TableHead className="w-[30%] text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
                  Comment
                </TableHead>
                <TableHead className="w-[16%] text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviewRows.map((row, rowIndex) => (
                <TableRow
                  key={
                    row.review._id ??
                    `${row.outfit._id ?? row.outfit.name}-${row.review.userID}-${row.groupIndex}-${rowIndex}`
                  }
                  className={
                    row.groupIndex > 0 && row.firstInGroup
                      ? "border-t-2 border-border/60 transition-colors hover:bg-muted/30"
                      : "transition-colors hover:bg-muted/30"
                  }
                >
                  {row.firstInGroup ? (
                    <TableCell
                      rowSpan={row.groupSize}
                      className="border-r border-border/50 align-top"
                    >
                      <p className="truncate font-medium text-foreground">
                        {row.outfit.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {row.groupSize} review{row.groupSize === 1 ? "" : "s"}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <StarIcon className="size-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium tabular-nums text-foreground">
                          {row.averageRating.toFixed(1)}
                        </span>
                        <span>/ 5</span>
                      </p>
                    </TableCell>
                  ) : null}
                  <TableCell className="truncate text-sm font-medium text-foreground">
                    {row.review.userSnapshot?.fullname ?? row.review.userID}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1.5">
                      <StarIcon className="size-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold tabular-nums text-foreground">
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
                  <TableCell className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
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
    </div>
  );
}
