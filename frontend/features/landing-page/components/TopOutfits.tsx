"use client";
import Image from "next/image";
import {Heart} from "lucide-react";
import {topOutfitsData} from "@/features/landing-page/data";
import {useRouter} from "next/navigation";

export default function TopOutfits() {
  const router = useRouter();
  return (
    <section id="outfits" className="scroll-mt-24 py-14 md:py-20">
      <div className="mx-auto max-w-[100rem] px-6 md:px-9">
        <header className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold text-[#6d3c8e] md:text-5xl">
            {topOutfitsData.title}
          </h2>
          <p className="mx-auto mt-6 max-w-4xl text-lg leading-relaxed text-[#616161] md:text-xl md:leading-[1.5]">
            {topOutfitsData.description}
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {topOutfitsData.items.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className="group relative h-[28rem] overflow-hidden rounded-[34px] ring-1 ring-black/5"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/0 transition-colors duration-300 group-hover:from-black/80" />

              {/* wishlist */}
              <button
                aria-label="Add to wishlist"
                className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-full
                           bg-white/15 text-white opacity-0 backdrop-blur-md transition-all duration-300
                           hover:bg-white/25 group-hover:opacity-100"
              >
                <Heart size={16} />
              </button>

              {/* price */}
              <p
                className="absolute top-4 right-4 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold
                           text-white backdrop-blur-md"
              >
                {item.price}
              </p>

              <div className="absolute right-0 bottom-0 left-0 p-6 text-white">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-[#e3c8f7] uppercase">
                  <span className="h-1 w-1 rounded-full bg-[#e3c8f7]" />
                  {item.category}
                </p>
                <h3 className="mt-1.5 text-[1.7rem] leading-tight font-semibold">
                  {item.title}
                </h3>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between pb-5">
          <button
            onClick={() => router.push("/dashboard/browse")}
            className="rounded-full bg-[#6d3c8e] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#5c3179] hover:shadow-md"
          >
            {topOutfitsData.ctaText}
          </button>
        </div>
      </div>
    </section>
  );
}
