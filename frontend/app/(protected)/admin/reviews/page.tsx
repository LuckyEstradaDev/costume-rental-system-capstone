"use client";

import {useMemo, useState} from "react";
import {Boxes, MessageSquare, PenLine, Star} from "lucide-react";

import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {StatCard} from "@/components/ui/stat-card";
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
  // keeps each card's review count and average rating describing exactly the
  // reviews listed underneath it.
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

  // Derived from `filteredOutfitReviews` - the same array the list below renders
  // - so the cards and the rows can never disagree. That is also why the totals
  // move as you type: the search narrows the list, and the cards describe the
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

  const loadingValue = isLoading ? "—" : null;

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total reviews"
          icon={MessageSquare}
          ariaBusy={isLoading}
          value={loadingValue ?? reviewStats.total}
          hint="in the current selection"
        />
        <StatCard
          label="Average rating"
          icon={Star}
          ariaBusy={isLoading}
          value={
            loadingValue ??
            (reviewStats.averageRating === null
              ? "—"
              : reviewStats.averageRating.toFixed(1))
          }
          hint="out of 5"
        />
        <StatCard
          label="With comment"
          icon={PenLine}
          ariaBusy={isLoading}
          value={loadingValue ?? reviewStats.withComment}
          hint="left written feedback"
        />
        <StatCard
          label="Outfits reviewed"
          icon={Boxes}
          ariaBusy={isLoading}
          value={loadingValue ?? reviewStats.outfits}
          hint="have at least one review"
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
        <div className="space-y-4">
          {filteredOutfitReviews.map(({outfit, reviews, averageRating}) => {
            if (reviews.length > 0) {
              return (
                <Card
                  key={outfit._id ?? outfit.name}
                  className="overflow-hidden border-0 shadow-sm ring-1 ring-border/60"
                >
                  {/* Card Header */}
                  <div className="flex flex-col gap-4 border-b border-border/50 bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <MessageSquare className="size-4 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-semibold leading-tight text-foreground">
                          {outfit.name}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {reviews.length} review
                          {reviews.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1.5 ring-1 ring-yellow-200/80 w-fit">
                      <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold tabular-nums text-yellow-700">
                        {averageRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-yellow-600/70">/ 5</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/20 hover:bg-muted/20">
                          <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
                            User
                          </TableHead>
                          <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
                            Stars
                          </TableHead>
                          <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
                            Comment
                          </TableHead>
                          <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
                            Date
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reviews.map((review) => (
                          <TableRow
                            key={review._id ?? review.userID}
                            className="transition-colors hover:bg-muted/30"
                          >
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {review.userSnapshot?.fullname ?? review.userID}
                            </TableCell>
                            <TableCell>
                              <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2 py-0.5 ring-1 ring-yellow-200/60">
                                <Star className="size-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-semibold tabular-nums text-yellow-700">
                                  {review.stars}
                                </span>
                                <span className="text-[10px] text-yellow-500/70">
                                  /5
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs text-sm text-foreground/80">
                              {review.comment ? (
                                <span className="line-clamp-2">
                                  {review.comment}
                                </span>
                              ) : (
                                <span className="italic text-muted-foreground/50">
                                  No comment
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs tabular-nums text-muted-foreground">
                              {review.createdAt
                                ? formatReadableDate(new Date(review.createdAt))
                                : "Unknown"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
