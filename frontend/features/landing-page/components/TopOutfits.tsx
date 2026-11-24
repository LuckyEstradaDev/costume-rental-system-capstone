"use client";

import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {ArrowRight, Shirt} from "lucide-react";

import {Button} from "@/components/ui/button";
import {fetchOutfitsService} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {EmptyState} from "@/components/ui/empty-state";
import Reveal from "@/features/landing-page/components/Reveal";
import {topOutfitsData} from "@/features/landing-page/data";
import {useCarousel} from "@/features/landing-page/hooks/useCarousel";
import {buildOutfitPath} from "@/lib/reference-path";
import {OutfitBranchBadge} from "@/features/reusable/OutfitBranchBadge";

const FALLBACK_IMAGE = "/assets/images/landing-page/suit.jpg";
const MAX_OUTFITS = 8; // four show at once on desktop, the rest scroll in
// Negative margin + padding gives the card shadows and hover lift room,
// because overflow-x-auto would otherwise clip them.
const CAROUSEL_TRACK =
  "-mx-3 mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-3 px-3 pt-3 pb-10 sm:gap-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
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

  const featuredOutfits = outfits.slice(0, MAX_OUTFITS);
  const {setContainerRef, interactionHandlers} = useCarousel({
    itemCount: featuredOutfits.length,
  });

  return (
    <section
      id="outfits"
      className="scroll-mt-24 overflow-hidden bg-white py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <Reveal>
          <header className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-semibold text-primary md:text-5xl">
              {topOutfitsData.title}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
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
                  <article className="group relative h-[24rem] overflow-hidden rounded-xl bg-muted shadow-lg shadow-primary/20 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/30 lg:h-[28rem]">
                    {detailHref && (
                      <Link
                        href={detailHref}
                        aria-label={`View ${outfit.name}`}
                        draggable={false}
                        className="absolute inset-0 z-20 rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                      />
                    )}

                    <Image
                      src={imageSrc}
                      alt={outfit.name || "Outfit"}
                      fill
                      draggable={false}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />

                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      {hasArModel && (
                        <span className="rounded-xl bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
                          With AR
                        </span>
                      )}
                      <OutfitBranchBadge branch={outfit.branch} />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 bg-secondary/85 p-4 text-primary-foreground">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm text-primary-foreground/70">
                          {outfit.category}
                        </p>
                        {price && (
                          <p className="shrink-0 text-base font-semibold text-accent">
                            {price}
                          </p>
                        )}
                      </div>
                      <h3 className="mt-1 text-lg leading-tight font-semibold">
                        {outfit.name}
                      </h3>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Shirt}
            title="No outfits available yet"
            className="mt-12"
          />
        )}

        {featuredOutfits.length > 0 && (
          <Reveal className="flex justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/dashboard/browse")}
              className="h-12 gap-2 px-6"
            >
              {topOutfitsData.ctaText}
              <ArrowRight className="size-5" />
            </Button>
          </Reveal>
        )}
      </div>
    </section>
  );
}