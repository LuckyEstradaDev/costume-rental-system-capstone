"use client";

import React from "react";
import {MessageSquare, Pause, Play, Star} from "lucide-react";
import {useQuery} from "@tanstack/react-query";

import {Button} from "@/components/ui/button";
import {getAllReviewsService} from "@/features/admin-dashboard/reviews-tab/services/reviewService";
import LandingEmptyState from "@/features/landing-page/components/LandingEmptyState";
import Reveal from "@/features/landing-page/components/Reveal";
import SmokeCircles from "@/features/landing-page/components/SmokeCircles";
import {testimonialsData} from "@/features/landing-page/data";
import {useCarousel} from "@/features/landing-page/hooks/useCarousel";

const CAROUSEL_TRACK =
  "mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const CAROUSEL_SLIDE =
  "w-full shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4.5rem)/4)]";

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

export default function Testimonial() {
  const {data: reviews = [], isLoading} = useQuery({
    queryKey: ["landing-reviews"],
    queryFn: getAllReviewsService,
  });

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
      className="relative scroll-mt-24 overflow-hidden bg-[#faf8fb] py-20 md:py-28"
    >
      <SmokeCircles />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 md:px-6">
        <Reveal>
          <header className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-semibold text-[#6d3c8e] md:text-5xl">
              {testimonialsData.title}
            </h2>
            <p className="mx-auto mt-6 max-w-4xl text-lg leading-relaxed text-[#616161] md:text-xl md:leading-[1.5]">
              {testimonialsData.description}
            </p>
          </header>
        </Reveal>

        {isLoading ? (
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
                className={`${CAROUSEL_SLIDE} h-52 animate-pulse rounded-xl bg-white`}
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
              const stars = Math.min(5, Math.max(0, Math.round(review.stars)));

              return (
                <Reveal
                  key={review._id ?? `${name}-${review.createdAt}`}
                  delay={index * 80}
                  data-carousel-slide
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Review ${index + 1} of ${featuredReviews.length}`}
                  className={CAROUSEL_SLIDE}
                >
                  <article className="h-full rounded-xl border border-black/[0.04] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_24px_-8px_rgba(109,60,142,0.12)] sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4dd2d3] to-[#6d3c8e] text-xs font-semibold text-white sm:h-11 sm:w-11 sm:text-sm">
                        {getInitials(name)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-xs font-semibold text-[#2b2b2b] sm:text-sm">
                          {name}
                        </h3>
                        <div className="mt-1 flex items-center gap-0.5">
                          {Array.from({length: 5}).map((_, index) => (
                            <Star
                              key={index}
                              size={13}
                              className={
                                index < stars
                                  ? "fill-[#f0b429] text-[#f0b429]"
                                  : "text-[#d8d0dd]"
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-5 text-xs leading-relaxed text-[#4f4f4f] sm:text-sm">
                      {review.comment}
                    </p>

                    {review.createdAt && (
                      <p className="mt-4 border-t border-[#f0eaf3] pt-3 text-[11px] text-[#9a9a9a] sm:text-xs">
                        {formatDate(review.createdAt)}
                      </p>
                    )}
                  </article>
                </Reveal>
              );
            })}
          </div>
          {isOverflowing && !prefersReducedMotion && (
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleAutoPause}
                aria-pressed={isAutoPaused}
              >
                {isAutoPaused ? <Play /> : <Pause />}
                {isAutoPaused ? "Play" : "Pause"}
              </Button>
            </div>
          )}
          </>
        ) : (
          <LandingEmptyState
            icon={MessageSquare}
            title="No reviews yet"
            description="Reviews from our customers will appear here. Be the first to share your experience after your next rental."
            className="mt-14"
          />
        )}
      </div>
    </section>
  );
}
