"use client";

import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {Shirt} from "lucide-react";

import {Button} from "@/components/ui/button";
import {fetchOutfitsService} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import LandingEmptyState from "@/features/landing-page/components/LandingEmptyState";
import {topOutfitsData} from "@/features/landing-page/data";
import {buildOutfitPath} from "@/lib/reference-path";

const FALLBACK_IMAGE = "/assets/images/landing-page/suit.jpg";

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

  return (
    <section id="outfits" className="scroll-mt-24 py-14 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <header className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold text-[#6d3c8e] md:text-5xl">
            {topOutfitsData.title}
          </h2>
          <p className="mx-auto mt-6 max-w-4xl text-lg leading-relaxed text-[#616161] md:text-xl md:leading-[1.5]">
            {topOutfitsData.description}
          </p>
        </header>

        {isLoading ? (
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({length: 4}).map((_, index) => (
              <div
                key={index}
                className="h-[28rem] animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : featuredOutfits.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
                <article
                  key={outfit._id ?? outfit.referenceID ?? index}
                  className="group relative h-[28rem] cursor-pointer overflow-hidden rounded-xl ring-1 ring-black/5"
                >
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
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/0 transition-colors duration-300 group-hover:from-black/80" />

                  {price && (
                    <p className="absolute top-4 right-4 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      {price}
                    </p>
                  )}

                  <div className="absolute right-0 bottom-0 left-0 p-6 text-white">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-[#e3c8f7] uppercase">
                        <span className="h-1 w-1 rounded-full bg-[#e3c8f7]" />
                        {outfit.category}
                      </p>
                      {hasArModel && (
                        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                          With AR
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1.5 text-[1.7rem] leading-tight font-semibold">
                      {outfit.name}
                    </h3>
                  </div>
                </article>
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

        <div className="mt-8 flex items-center justify-between pb-5">
          <Button
            size="lg"
            onClick={() => router.push("/dashboard/browse")}
            className="px-5"
          >
            {topOutfitsData.ctaText}
          </Button>
        </div>
      </div>
    </section>
  );
}
