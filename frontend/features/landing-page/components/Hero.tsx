import React from "react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="max-w-[100rem] mx-auto px-2 pb-6 md:px-9 md:pb-8">
      <div className="relative flex h-[53rem] w-full items-start justify-center">
        <Image
          src="/assets/images/landing-page/hero-bg.jpg"
          alt="Wedding and formal outfits on hangers"
          fill
          priority
          className="object-cover rounded-[40px]"
        />
        <div className="absolute inset-0 bg-black/20 rounded-[40px]" />

        <div className="relative z-10 flex w-full flex-col items-center justify-start px-4 pt-10 text-center md:px-12 pt-[8rem]">
          <h1 className="max-w-4xl text-6xl leading-[1.08] font-bold text-white lg:text-8xl">
            Find the <span className="text-[#7d3e98]">Perfect Outfit</span> for
            Every Occasion
          </h1>

          <Image
            src="/assets/images/landing-page/hero-gown.png"
            alt="Blue layered gown"
            width={420}
            height={420}
            className="mt-4 z-50 h-auto md:mt-1 w-[550px] top-[23rem] absolute"
          />
        </div>

        <p className="md:block hidden absolute bottom-12 left-6 max-w-[19rem] text-xl leading-snug text-white md:bottom-16 md:left-[5rem]">
          Flexible fashion for weddings, galas, and special events.
        </p>

        <p className="md:block hidden absolute right-6 max-w-[20rem] md:text-xl leading-snug text-white md:right-12 bottom-16 md:bottom-[7rem]">
          Own or rent curated gowns, suits, and costumes for unforgettable
          moments.
        </p>
      </div>
    </section>
  );
}
