import React from "react";
import Image from "next/image";
import SmokeCircles from "@/features/landing-page/components/SmokeCircles";

export default function Hero() {
  return (
    <>
      <section
        id="home"
        className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 md:px-6"
      >
        <div className="relative flex h-[calc(100svh-5rem)] w-full flex-col items-center">
          <Image
            src="/assets/images/landing-page/hero-bg.jpg"
            alt="Wedding and formal outfits on hangers"
            fill
            priority
            className="object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-black/20 rounded-xl" />
          <SmokeCircles className="rounded-xl" />

          <div className="relative z-10 flex w-full flex-col items-center justify-start px-4 pt-16 text-center md:px-12 md:pt-[8rem]">
            <h1 className="max-w-4xl text-4xl leading-[1.08] font-bold text-white sm:text-5xl md:text-6xl lg:text-8xl">
              Find the <span className="text-[#df8dff]">Perfect Outfit</span> for
              Every Occasion
            </h1>
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

      <div className="relative z-40 mx-auto -mt-[calc(100svh_-_29rem)] flex w-full max-w-7xl justify-center px-4 sm:-mt-[calc(100svh_-_31rem)] md:-mt-[calc(100svh_-_33rem)] md:px-6 lg:-mt-[calc(100svh_-_35rem)]">
        <Image
          src="/assets/images/landing-page/hero-gown.png"
          alt="Blue layered gown"
          width={420}
          height={420}
          className="h-auto w-[340px] sm:w-[420px] md:w-[500px] lg:w-[550px]"
        />
      </div>
    </>
  );
}
