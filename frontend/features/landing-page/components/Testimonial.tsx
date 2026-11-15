"use client";

import React from "react";
import Link from "next/link";
import {ArrowRight, Pause, Play, Star} from "lucide-react";
import {useQuery} from "@tanstack/react-query";

import {Button} from "@/components/ui/button";
import {getAllReviewsService} from "@/features/admin-dashboard/reviews-tab/services/reviewService";
import Reveal from "@/features/landing-page/components/Reveal";
import SmokeCircles from "@/features/landing-page/components/SmokeCircles";
import {testimonialsData} from "@/features/landing-page/data";
import {useCarousel} from "@/features/landing-page/hooks/useCarousel";

// items-start lets cards take their own height; vertical padding leaves
// room for the stagger offset and tilt so overflow-x-auto doesn't clip them.
const CAROUSEL_TRACK =
  "mt-12 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto pt-2 pb-12 sm:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const CAROUSEL_SLIDE =
  "w-full shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4.5rem)/4)]";

// Alternate offset and tilt so the row reads like pinned notes.
const SLIDE_OFFSETS = ["", "mt-8", "mt-3", "mt-10"];
const SLIDE_TILTS = ["-rotate-1", "rotate-1", "rotate-[0.5deg]", "-rotate-[0.5deg]"];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function PlaceholderCard({index}: {index: number}) {
  // Different text lengths so the placeholders stagger like real notes.
  const lines = [
    ["w-full", "w-11/12", "w-2/3"],
    ["w-full", "w-4/5", "w-full", "w-1/2"],
    ["w-full", "w-3/4"],
    ["w-full", "w-11/12", "w-5/6", "w-2/5"],
  ][index % 4];
  const visibility = index === 0 ? "" : index === 1 ? "hidden sm:block" : "hidden lg:block";

  return (
    <div className={`${visibility} ${SLIDE_OFFSETS[index % 4]}`}>
      <div
        aria-hidden
        className={`rounded-xl bg-white p-5 opacity-50 sm:p-6 ${SLIDE_TILTS[index % 4]}`}
      >
        <Star size={14} className="text-border" />
        <div className="mt-4 space-y-2.5">
          {lines.map((width, i) => (
            <div key={i} className={`h-2.5 rounded-full bg-primary/10 ${width}`} />
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3">
          <div className="size-10 shrink-0 rounded-full bg-primary/10" />
          <div className="h-2.5 w-24 rounded-full bg-primary/10" />
        </div>
      </div>
    </div>
  );
}

export default function Testimonial() {
  const {data: reviews = [], isLoading} = useQuery({
    queryKey: ["landing-reviews"],
    queryFn: getAllReviewsService,
  });

  const showLoading = isLoading;

  const featuredReviews = reviews
    .filter((review) => review.comment?.trim())
    .slice(0, 4);
  const {
    setContainerRef,
    interactionHandlers,
    isOverflowing,
    isAutoPaused,
    prefersReducedMotion,
    toggleAutoPause,
  } = useCarousel({
    itemCount: featuredReviews.length,
    autoScrollMs: 5000,
  });

  return (
    <section
      id="reviews"
      className="relative scroll-mt-24 overflow-hidden bg-primary py-16 md:py-24"
    >
      <SmokeCircles />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 md:px-6">
        <Reveal>
          <header className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-semibold text-white md:text-5xl">
              {testimonialsData.title}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl">
              {testimonialsData.description}
            </p>
          </header>
        </Reveal>

        {showLoading ? (
          <div
            ref={setContainerRef}
            {...interactionHandlers}
            role="region"
            aria-roledescription="carousel"
            aria-label="Customer reviews"
            className={CAROUSEL_TRACK}
          >
            {Array.from({length: 4}).map((_, index) => (
              <div
                key={index}
                data-carousel-slide
                className={`${CAROUSEL_SLIDE} h-48 animate-pulse rounded-xl bg-white/15 ${SLIDE_OFFSETS[index]}`}
              />
            ))}
          </div>
        ) : featuredReviews.length > 0 ? (
          <>
            <div
              ref={setContainerRef}
              {...interactionHandlers}
              role="region"
              aria-roledescription="carousel"
              aria-label="Customer reviews"
              className={CAROUSEL_TRACK}
            >
              {featuredReviews.map((review, index) => {
                const name = review.userSnapshot?.fullname || "Customer";
                const stars = Math.min(
                  5,
                  Math.max(0, Math.round(review.stars)),
                );

                return (
                  <Reveal
                    key={review._id ?? `${name}-${review.createdAt}`}
                    delay={index * 80}
                    data-carousel-slide
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`Review ${index + 1} of ${featuredReviews.length}`}
                    className={`${CAROUSEL_SLIDE} ${SLIDE_OFFSETS[index % 4]}`}
                  >
                    <article
                      className={`rounded-xl bg-white p-5 sm:p-6 ${SLIDE_TILTS[index % 4]}`}
                    >
                      <div
                        className="flex items-center gap-1"
                        aria-label={`${stars} out of 5 stars`}
                      >
                        {Array.from({length: 5}).map((_, starIndex) => (
                          <Star
                            key={starIndex}
                            size={14}
                            className={
                              starIndex < stars
                                ? "fill-accent text-accent"
                                : "text-border"
                            }
                          />
                        ))}
                      </div>

                      <p className="mt-3 line-clamp-6 text-sm leading-relaxed text-foreground/80 sm:text-base">
                        {review.comment}
                      </p>

                      <div className="mt-5 flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                          {getInitials(name)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-primary">
                            {name}
                          </h3>
                          {review.createdAt && (
                            <p className="text-xs text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
            {isOverflowing && !prefersReducedMotion && (
              <div className="-mt-6 flex justify-end">
                <Button
                  type="button"
                  size="lg"
                  className="h-12 gap-2 px-6"
                  onClick={toggleAutoPause}
                  aria-pressed={isAutoPaused}
                >
                  {isAutoPaused ? (
                    <Play className="size-5" />
                  ) : (
                    <Pause className="size-5" />
                  )}
                  {isAutoPaused ? "Play" : "Pause"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="relative mt-12 pb-12">
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              {Array.from({length: 4}).map((_, index) => (
                <PlaceholderCard key={index} index={index} />
              ))}
            </div>

            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="rounded-xl bg-white px-8 py-6 text-center">
                <p className="text-lg font-semibold text-primary">
                  Reviews will appear here after your first rental.
                </p>
                <Button asChild size="lg" className="mt-4 h-12 gap-2 px-6">
                  <Link href="/dashboard/browse">
                    Browse outfits
                    <ArrowRight className="size-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}