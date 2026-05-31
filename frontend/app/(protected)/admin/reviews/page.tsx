"use client";

import {useEffect, useMemo, useState} from "react";
import {MessageSquare, RefreshCw, Search, Star} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
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
import {IReview} from "@/features/user-dashboard/review/types/IReview";

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
  const [outfitReviews, setOutfitReviews] = useState<OutfitReviewData[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReviews = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [outfitsResponse, reviewsResponse] = await Promise.all([
        fetchOutfitsService(),
        getAllReviewsService(),
      ]);

      const outfits = outfitsResponse.data as OutfitItem[];
      const reviews = reviewsResponse.data as IReview[];

      const reviewsByOutfit = outfits.map((outfit) => {
        const outfitReviews = outfit._id
          ? reviews.filter((review) => review.outfitID === outfit._id)
          : [];

        const averageRating = outfitReviews.length
          ? outfitReviews.reduce(
              (sum, review) => sum + (review.stars ?? 0),
              0,
            ) / outfitReviews.length
          : 0;

        return {
          outfit,
          reviews: outfitReviews,
          averageRating,
        };
      });

      setOutfitReviews(reviewsByOutfit);
    } catch (err) {
      setError(
        typeof err === "string" ? err : "Unable to load outfit reviews.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
  }, []);

  const filteredOutfitReviews = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return outfitReviews;
    }

    return outfitReviews.filter(({outfit, reviews}) => {
      const outfitName = outfit.name.toLowerCase();
      const matchesOutfit = outfitName.includes(normalizedSearch);
      const matchesReview = reviews.some((review) =>
        [review.userID, review.comment]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedSearch)),
      );

      return matchesOutfit || matchesReview;
    });
  }, [outfitReviews, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <MessageSquare className="size-4.5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Outfit Reviews
            </h1>
            <p className="text-sm text-muted-foreground">
              View customer reviews for each outfit and inspect rating details.
            </p>
          </div>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Review library</h2>
            <p className="text-sm text-muted-foreground">
              Search by outfit name, reviewer ID, or review text.
            </p>
          </div>

          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-10"
              placeholder="Search reviews..."
            />
          </div>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-destructive">{error}</p>
        ) : null}
      </Card>

      {filteredOutfitReviews.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">
          {isLoading
            ? "Loading reviews..."
            : "No reviews match the current search."}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOutfitReviews.map(({outfit, reviews, averageRating}) => (
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
                      {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {reviews.length > 0 ? (
                  <div className="flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1.5 ring-1 ring-yellow-200/80 w-fit">
                    <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold tabular-nums text-yellow-700">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-yellow-600/70">/ 5</span>
                  </div>
                ) : (
                  <Badge
                    variant="secondary"
                    className="rounded-full text-xs w-fit"
                  >
                    No rating yet
                  </Badge>
                )}
              </div>

              {/* Reviews Table / Empty State */}
              {reviews.length > 0 ? (
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
              ) : (
                <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                  <MessageSquare className="size-7 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No reviews yet for this outfit.
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
