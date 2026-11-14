"use client";

import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {ChevronLeft, ChevronRight, Shirt} from "lucide-react";

import {Button} from "@/components/ui/button";
import {fetchOutfitsService} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import LandingEmptyState from "@/features/landing-page/components/LandingEmptyState";
import Reveal from "@/features/landing-page/components/Reveal";
import {topOutfitsData} from "@/features/landing-page/data";
import {useCarousel} from "@/features/landing-page/hooks/useCarousel";
import {buildOutfitPath} from "@/lib/reference-path";

const FALLBACK_IMAGE = "/assets/images/landing-page/suit.jpg";
const CAROUSEL_TRACK =
  "mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:gap-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const CAROUSEL_SLIDE =
  "w-full shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3.75rem)/4)]";

function formatPrice(value?: string) {
  if (!value) return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? `₱${amount.toLocaleString()}` : null;
}

export default function TopOutfits() {
  const router = useRouter();
  const {data: outfits = [], isLoading} = useQuery({
    queryKey: ["outfits"],
    queryFn: fetchOutfitsService,
  });

  const featuredOutfits = outfits.slice(0, 4);
  const {
    setContainerRef,
    interactionHandlers,
    isOverflowing,
    previous,
    next,
  } = useCarousel({itemCount: featuredOutfits.length});

  return (
    <section id="outfits" className="scroll-mt-24 py-14 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <Reveal>
          <header className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-semibold text-[#6d3c8e] md:text-5xl">
              {topOutfitsData.title}
            </h2>
            <p className="mx-auto mt-6 max-w-4xl text-lg leading-relaxed text-[#616161] md:text-xl md:leading-[1.5]">
              {topOutfitsData.description}
            </p>
          </header>
        </Reveal>

        {isLoading ? (
          <div
            ref={setContainerRef}
            {...interactionHandlers}
            role="region"
            aria-roledescription="carousel"
            aria-label="Top outfits"
            className={CAROUSEL_TRACK}
          >
            {Array.from({length: 4}).map((_, index) => (
              <div
                key={index}
                data-carousel-slide
                className={`${CAROUSEL_SLIDE} h-[24rem] animate-pulse rounded-xl bg-muted lg:h-[28rem]`}
              />
            ))}
          </div>
        ) : featuredOutfits.length > 0 ? (
          <div
            ref={setContainerRef}
            {...interactionHandlers}
            role="region"
            aria-roledescription="carousel"
            aria-label="Top outfits"
            className={CAROUSEL_TRACK}
          >
            {featuredOutfits.map((outfit, index) => {
              const price = formatPrice(outfit.rentalPrice ?? outfit.price);
              const imageSrc =
                typeof outfit.imageURL === "string"
                  ? outfit.imageURL
                  : FALLBACK_IMAGE;
              const detailHref =
                buildOutfitPath(outfit.referenceID) ||
                buildOutfitPath(outfit._id);
              const hasArModel =
                typeof outfit.modelURL === "string" &&
                Boolean(outfit.modelURL);

              return (
                <Reveal
                  key={outfit._id ?? outfit.referenceID ?? index}
                  delay={index * 80}
                  data-carousel-slide
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Outfit ${index + 1} of ${featuredOutfits.length}`}
                  className={CAROUSEL_SLIDE}
                >
                  <article className="group relative h-[24rem] cursor-pointer overflow-hidden rounded-xl ring-1 ring-black/5 lg:h-[28rem]">
                    {detailHref && (
                      <Link
                        href={detailHref}
                        aria-label={`View ${outfit.name}`}
                        className="absolute inset-0 z-20 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    )}

                    <Image
                      src={imageSrc}
                      alt={outfit.name || "Outfit"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/0 transition-colors duration-300 group-hover:from-black/80" />

                    <div className="absolute right-0 bottom-0 left-0 p-4 text-white sm:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[10px] font-semibold tracking-[0.14em] text-[#e3c8f7] uppercase sm:text-[11px]">
                            {outfit.category}
                          </p>
                          {hasArModel && (
                            <span className="border-l border-white/30 pl-2 text-[10px] font-semibold tracking-[0.14em] text-white/80 uppercase sm:text-[11px]">
                              With AR
                            </span>
                          )}
                        </div>
                        {price && (
                          <p className="text-xs font-semibold text-white sm:text-sm">
                            {price}
                          </p>
                        )}
                      </div>
                      <h3 className="mt-1.5 text-lg leading-tight font-semibold sm:text-[1.7rem]">
                        {outfit.name}
                      </h3>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <LandingEmptyState
            icon={Shirt}
            title="No outfits available yet"
            description="Our catalog is being updated. Please check back soon to see our latest gowns, suits, and costumes."
            className="mt-12"
          />
        )}

        <Reveal className="mt-6 flex items-center justify-between gap-4 pb-5">
          <Button
            size="lg"
            onClick={() => router.push("/dashboard/browse")}
            className="px-5"
          >
            {topOutfitsData.ctaText}
          </Button>

          {/* {isOverflowing && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Previous outfits"
                onClick={previous}
              >
                <ChevronLeft />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Next outfits"
                onClick={next}
              >
                <ChevronRight />
              </Button>
            </div>
          )} */}
        </Reveal>
      </div>
    </section>
  );
}
