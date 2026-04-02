import Image from "next/image";
import React from "react";
import {ArrowLeftCircle, ArrowRightCircle} from "lucide-react";
import {topOutfitsData} from "@/features/landing-page/data";

export default function TopOutfits() {
  return (
    <section className="py-14 md:py-20">
      <div className="mx-auto max-w-[100rem] px-6 md:px-9">
        <header className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold text-[#6d3c8e] md:text-5xl">
            {topOutfitsData.title}
          </h2>
          <p className="mx-auto mt-6 max-w-4xl text-lg leading-relaxed text-[#616161] md:text-xl md:leading-[1.5]">
            {topOutfitsData.description}
          </p>
        </header>

        <p className="mt-12 text-3xl font-semibold text-[#6d3c8e]">
          {topOutfitsData.title}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {topOutfitsData.items.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className="group relative h-[28rem] overflow-hidden rounded-[34px]"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

              <p className="absolute top-5 right-4 rounded-full bg-[#d5c2e7]/90 px-4 py-1 text-sm font-semibold text-[#6d3c8e]">
                {item.price}
              </p>

              <div className="absolute right-0 bottom-0 left-0 p-6 text-white">
                <h3 className="text-[1.8rem] leading-tight font-semibold">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-white/85">{item.category}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between pb-5">
          <button className="rounded-full bg-[#6d3c8e] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">
            {topOutfitsData.ctaText}
          </button>

          <div className="flex items-center gap-3 text-[#6d3c8e]">
            <button
              aria-label="Previous outfits"
              className="transition-opacity hover:opacity-80"
            >
              <ArrowLeftCircle size={32} />
            </button>
            <button
              aria-label="Next outfits"
              className="transition-opacity hover:opacity-80"
            >
              <ArrowRightCircle size={32} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
