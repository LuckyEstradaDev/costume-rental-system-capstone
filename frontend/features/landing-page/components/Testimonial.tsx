"use client";

import React from "react";
import {MessageSquare, Star} from "lucide-react";
import {useQuery} from "@tanstack/react-query";

import {getAllReviewsService} from "@/features/admin-dashboard/reviews-tab/services/reviewService";
import LandingEmptyState from "@/features/landing-page/components/LandingEmptyState";
import SmokeCircles from "@/features/landing-page/components/SmokeCircles";
import {testimonialsData} from "@/features/landing-page/data";

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
    .slice(0, 6);

  return (
    <section
      id="reviews"
      className="relative scroll-mt-24 overflow-hidden bg-[#faf8fb] py-20 md:py-28"
    >
      <SmokeCircles />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 md:px-6">
        <header className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold text-[#6d3c8e] md:text-5xl">
            {testimonialsData.title}
          </h2>
          <p className="mx-auto mt-6 max-w-4xl text-lg leading-relaxed text-[#616161] md:text-xl md:leading-[1.5]">
            {testimonialsData.description}
          </p>
        </header>

        {isLoading ? (
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({length: 3}).map((_, index) => (
              <div
                key={index}
                className="h-52 animate-pulse rounded-xl bg-white"
              />
            ))}
          </div>
        ) : featuredReviews.length > 0 ? (
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredReviews.map((review) => {
              const name = review.userSnapshot?.fullname || "Customer";
              const stars = Math.min(5, Math.max(0, Math.round(review.stars)));

              return (
                <article
                  key={review._id ?? `${name}-${review.createdAt}`}
                  className="rounded-xl border border-black/[0.04] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_24px_-8px_rgba(109,60,142,0.12)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4dd2d3] to-[#6d3c8e] text-sm font-semibold text-white">
                      {getInitials(name)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#2b2b2b]">
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

                  <p className="mt-4 line-clamp-5 text-sm leading-relaxed text-[#4f4f4f]">
                    {review.comment}
                  </p>

                  {review.createdAt && (
                    <p className="mt-4 border-t border-[#f0eaf3] pt-3 text-xs text-[#9a9a9a]">
                      {formatDate(review.createdAt)}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
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
