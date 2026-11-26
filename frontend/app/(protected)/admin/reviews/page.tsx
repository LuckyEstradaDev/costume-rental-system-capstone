"use client";

import Image from "next/image";
import {useMemo, useRef, useState} from "react";
import type {ReactNode} from "react";
import {Eye, EyeOff, MessageSquare, Reply, SlidersHorizontal, Star as StarIcon} from "lucide-react";

import {Dialog} from "@/components/ui/dialog";
import {DropdownMenuItem} from "@/components/ui/dropdown-menu";
import {AdminDialogBody, AdminDialogContent, AdminDialogFooter, AdminDialogHeader} from "@/features/admin-dashboard/components/AdminDialog";
import {CardDropdownMenu} from "@/features/admin-dashboard/inventory-tab/components/CardDropdownMenu";
import {UserAvatar} from "@/components/UserAvatar";
import {Textarea} from "@/components/ui/textarea";
import type {IReview} from "@/features/user-dashboard/review/types/IReview";
import {Skeleton} from "@/components/ui/skeleton";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
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
import {getModerationReviews} from "@/features/admin-dashboard/reviews-tab/services/reviewService";
import {useDateWindow} from "@/features/admin-dashboard/dashboard/hooks/useDateWindow";
import {EmptyState} from "@/components/ui/empty-state";
import {AdminPageHeader, AdminPageTitle} from "@/features/admin-dashboard/components/AdminPageHeader";
import {AdminSearchInput} from "@/features/admin-dashboard/components/AdminSearchInput";
import {AdminSegmented} from "@/features/admin-dashboard/components/AdminSegmented";
import {DateRangeSlicer} from "@/features/admin-dashboard/dashboard/components/slicers/DateRangeSlicer";
import {isWithinRange} from "@/features/admin-dashboard/dashboard/utils/dateRange";
import {api} from "@/lib/axios";
import {useMutation, useQueryClient, useQuery} from "@tanstack/react-query";

type RatingFilter = "all" | "1" | "2" | "3" | "4" | "5";

const RATING_FILTER_OPTIONS = [
  {value: "all", label: "All"},
  {value: "5", label: "5 stars"},
  {value: "4", label: "4 stars"},
  {value: "3", label: "3 stars"},
  {value: "2", label: "2 stars"},
  {value: "1", label: "1 star"},
] as const;

function SectionHeading({children}: {children: ReactNode}) {
  return (
    <h2 className="text-xl font-semibold text-primary md:text-2xl">
      {children}
    </h2>
  );
}

function OutfitThumbnail({src}: {src?: string}) {
  return (
    <div className="relative size-9 shrink-0 overflow-hidden rounded-md bg-muted">
      <Image
        src={src || "/assets/images/landing-page/suit.jpg"}
        alt=""
        fill
        sizes="36px"
        className="object-contain"
      />
    </div>
  );
}

export default function AdminReviewsPage() {
  //fetchers
  const queryClient = useQueryClient();
  const moderation = useMutation({
    mutationFn: ({id, changes}: {id: string; changes: {reply?: string; commentHidden?: boolean}}) =>
      api.patch(`/api/reviews/${id}/moderation`, changes),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ["outfit-reviews"]}),
  });
  const reviewsData = useQuery({
    queryKey: ["outfit-reviews", "moderation"],
    queryFn: getModerationReviews,
  });

  const outfitsData = useQuery({
    queryKey: ["outfits"],
    queryFn: fetchOutfitsService,
  });

  const [replyReview, setReplyReview] = useState<IReview | null>(null);
  const reviewerName = replyReview?.userSnapshot?.fullname?.trim() || "Customer";
  const [reviewerFirstName, ...reviewerLastName] = reviewerName.split(/\s+/);
  const replyTrigger = useRef<HTMLButtonElement | null>(null);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [selectedOutfitIds, setSelectedOutfitIds] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const dateWindow = useDateWindow();

  const isLoading = reviewsData.isLoading || outfitsData.isLoading;
  const error =
    reviewsData.error || outfitsData.error
      ? "Unable to load outfit reviews."
      : "";

  const outfitsById = useMemo(() => {
    const outfits = new Map<string, {name: string; image?: string}>();
    for (const outfit of outfitsData.data ?? []) {
      if (outfit._id) {
        outfits.set(outfit._id, {
          name: outfit.name,
          image: typeof outfit.imageURL === "string" ? outfit.imageURL : undefined,
        });
      }
    }
    return outfits;
  }, [outfitsData.data]);

  const outfitOptions = useMemo(
    () => [...outfitsById].sort((a, b) => a[1].name.localeCompare(b[1].name)),
    [outfitsById],
  );

  const reviewRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rating = ratingFilter === "all" ? null : Number(ratingFilter);
    const outfitIds = new Set(selectedOutfitIds);

    return (reviewsData.data ?? []).flatMap((review) => {
      if (!isWithinRange(review.createdAt, dateWindow.range)) return [];
      if (rating !== null && review.stars !== rating) return [];
      if (outfitIds.size && !outfitIds.has(review.outfitID)) return [];

      const outfit = outfitsById.get(review.outfitID);
      const outfitName = outfit?.name ?? "Unavailable outfit";
      const matchesSearch = [outfitName, review.userSnapshot?.fullname, review.userID, review.comment]
        .some((value) => value?.toLowerCase().includes(query));
      return matchesSearch ? [{outfitName, image: outfit?.image, review}] : [];
    });
  }, [reviewsData.data, dateWindow.range, ratingFilter, selectedOutfitIds, outfitsById, search]);

  const hasActiveFilters =
    search.trim() !== "" || ratingFilter !== "all" || selectedOutfitIds.length > 0;

  const clearFilters = () => {
    setSearch("");
    setRatingFilter("all");
    setSelectedOutfitIds([]);
  };

  const reviewStats = useMemo(() => {
    const total = reviewRows.length;
    const totalStars = reviewRows.reduce((sum, {review}) => sum + review.stars, 0);

    return {
      total,
      averageRating: total === 0 ? null : totalStars / total,
      withComment: reviewRows.filter(({review}) => Boolean(review.comment?.trim())).length,
      outfits: new Set(reviewRows.map(({review}) => review.outfitID)).size,
    };
  }, [reviewRows]);

  return (
    <div className="-m-6 min-h-[calc(100vh-4.5rem)] space-y-6 bg-muted p-6">
      <AdminPageHeader
        title={
          <AdminPageTitle icon={MessageSquare}>Outfit reviews</AdminPageTitle>
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <SectionHeading>All reviews</SectionHeading>
            {moderation.isError && <p role="alert" className="text-destructive">Could not save the review change.</p>}
            <span className="whitespace-nowrap text-sm text-muted-foreground">
              {reviewStats.total} {reviewStats.total === 1 ? "review" : "reviews"}
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <AdminSearchInput
              value={search}
              onValueChange={setSearch}
              placeholder="Search"
              wrapperClassName="w-full sm:w-64"
              className="h-9"
            />
            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 bg-background hover:border-secondary hover:bg-secondary hover:text-secondary-foreground"
                >
                  <SlidersHorizontal className="size-4" />
                  Filters
                  {hasActiveFilters ? (
                    <span className="size-1.5 rounded-full bg-accent" />
                  ) : null}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 space-y-3 p-3">
                <p className="text-sm font-semibold text-secondary">
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
                <fieldset className="space-y-2 border-t border-border pt-2">
                  <legend className="pr-2 text-sm font-semibold text-secondary">Outfits</legend>
                  <p className="text-xs text-muted-foreground">
                    {selectedOutfitIds.length ? `${selectedOutfitIds.length} selected` : "All outfits"}
                  </p>
                  <div className="max-h-44 space-y-1 overflow-y-auto">
                    {outfitOptions.map(([outfitId, outfit]) => (
                      <label key={outfitId} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted">
                        <Checkbox
                          checked={selectedOutfitIds.includes(outfitId)}
                          onCheckedChange={(checked) =>
                            setSelectedOutfitIds((current) =>
                              checked === true
                                ? [...current, outfitId]
                                : current.filter((id) => id !== outfitId),
                            )
                          }
                        />
                        <OutfitThumbnail src={outfit.image} />
                        <span className="min-w-0 break-words">{outfit.name}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
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

        {error ? <p className="text-base text-destructive leading-relaxed">{error}</p> : null}

        {isLoading ? (
          <Skeleton role="status" aria-label="Loading reviews" className="h-[192px] w-full rounded-lg" />
        ) : reviewRows.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No reviews to show" />
        ) : (
          <Table gridlines className="min-w-[1040px] table-fixed">
            <TableHeader className="[&_tr]:border-0">
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className="w-[22%]">
                  Outfit
                </TableHead>
                <TableHead className="w-[17%]">
                  Reviewer
                </TableHead>
                <TableHead className="w-[10%] text-center">
                  Rating
                </TableHead>
                <TableHead>
                  Comment
                </TableHead>
                <TableHead className="w-28">Visibility</TableHead>
                <TableHead className="w-28">Reply</TableHead>
                <TableHead className="w-32">Date</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr]:border-0">
              {reviewRows.map((row, rowIndex) => (
                <TableRow
                  key={
                    row.review._id ??
                    `${row.review.outfitID}-${row.review.orderID}-${row.review.userID}-${rowIndex}`
                  }
                  className="border-0"
                >
                  <TableCell className="font-semibold text-secondary" title={row.outfitName}>
                    <div className="flex min-w-0 items-center gap-3">
                      <OutfitThumbnail src={row.image} />
                      <span className="truncate">{row.outfitName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="truncate text-sm font-medium text-secondary">
                    {row.review.userSnapshot?.fullname ?? row.review.userID}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1.5">
                      <StarIcon className="size-3.5 fill-accent text-accent" />
                      <span className="text-sm font-semibold tabular-nums text-secondary">
                        {row.review.stars}
                      </span>
                      <span className="text-sm text-muted-foreground">/ 5</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-sm leading-relaxed text-muted-foreground">
                    {row.review.comment ? (
                      <span className="line-clamp-2">{row.review.comment}</span>
                    ) : (
                      <span className="italic text-muted-foreground">
                        No comment
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-secondary">
                    {row.review.comment
                      ? row.review.commentHidden ? "Hidden" : "Visible"
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.review.reply ? "Replied" : row.review.comment ? "No reply" : "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
                    {row.review.createdAt
                      ? formatReadableDate(new Date(row.review.createdAt))
                      : "Unknown"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.review._id && row.review.comment && (
                      <CardDropdownMenu
                        label={`Actions for ${row.review.userSnapshot?.fullname ?? "customer"} review`}
                        triggerId={`review-actions-${rowIndex}`}
                        disabled={moderation.isPending}
                        modal={false}
                        onCloseAutoFocus={(event) => {
                          if (replyTrigger.current) event.preventDefault();
                        }}
                      >
                        <DropdownMenuItem onSelect={() => {
                          const trigger = document.getElementById(`review-actions-${rowIndex}`);
                          replyTrigger.current = trigger instanceof HTMLButtonElement ? trigger : null;
                          moderation.reset();
                          setReplyReview(row.review);
                        }}>
                          <Reply aria-hidden />
                          {row.review.reply ? "Edit reply" : "Reply"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => {
                          const id = row.review._id;
                          if (id) moderation.mutate({id, changes: {commentHidden: !row.review.commentHidden}});
                        }}>
                          {row.review.commentHidden ? <Eye aria-hidden /> : <EyeOff aria-hidden />}
                          {row.review.commentHidden ? "Show comment" : "Hide comment"}
                        </DropdownMenuItem>
                      </CardDropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
      <Dialog open={replyReview !== null} onOpenChange={(open) => {
        if (!open) setReplyReview(null);
      }}>
        <AdminDialogContent onCloseAutoFocus={(event) => {
          if (!replyTrigger.current?.isConnected) return;
          event.preventDefault();
          replyTrigger.current.focus();
          replyTrigger.current = null;
        }}>
          <AdminDialogHeader
            icon={Reply}
            title={replyReview?.reply ? "Edit reply" : "Reply to review"}
            description="Write a public response to the customer’s review."
          />
          {replyReview && (
            <form key={replyReview._id} className="flex min-h-0 flex-col" onSubmit={(event) => {
              event.preventDefault();
              const id = replyReview._id;
              const reply = String(new FormData(event.currentTarget).get("reply") ?? "").trim();
              if (!id || !reply) return;
              moderation.mutate({id, changes: {reply}}, {onSuccess: () => setReplyReview(null)});
            }}>
              <AdminDialogBody className="space-y-5">
                <div className="flex items-center gap-3">
                  <UserAvatar size="sm" src={replyReview.profilePicture}
                    firstName={reviewerFirstName} lastName={reviewerLastName.join(" ")} />
                  <p className="min-w-0 break-words font-semibold text-primary">{reviewerName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Comment</p>
                  <p className="whitespace-pre-wrap break-words text-base leading-relaxed">
                    {replyReview.comment}
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="review-reply" className="text-sm font-medium">Reply</label>
                  <Textarea id="review-reply" name="reply" placeholder="Write a reply…" required maxLength={2000}
                    defaultValue={replyReview.reply} disabled={moderation.isPending} />
                </div>
                {moderation.isError && <p role="alert" className="text-sm text-destructive">Could not save your reply.</p>}
              </AdminDialogBody>
              <AdminDialogFooter>
                <Button type="submit" disabled={moderation.isPending}>
                  {replyReview.reply ? "Save reply" : "Send reply"}
                </Button>
              </AdminDialogFooter>
            </form>
          )}
        </AdminDialogContent>
      </Dialog>
    </div>
  );
}
