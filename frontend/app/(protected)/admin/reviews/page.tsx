"use client";

import {useMemo, useState} from "react";
import {MessageSquare, Star} from "lucide-react";

import {Card} from "@/components/ui/card";
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
import {AdminPageHeader, AdminPageTitle} from "@/features/admin-dashboard/components/AdminPageHeader";
import {AdminSearchInput} from "@/features/admin-dashboard/components/AdminSearchInput";
import {DateRangeDropdown} from "@/features/admin-dashboard/dashboard/components/slicers/DateRangeDropdown";
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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={
          <AdminPageTitle icon={MessageSquare}>Outfit Reviews</AdminPageTitle>
        }
        actions={
          <DateRangeDropdown
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
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Review library</h2>
        </div>

        <AdminSearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="Search reviews…"
          wrapperClassName="sm:max-w-md"
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {filteredOutfitReviews.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">
          {isLoading
            ? "Loading reviews..."
            : "No reviews match the current search and date window."}
        </Card>
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
