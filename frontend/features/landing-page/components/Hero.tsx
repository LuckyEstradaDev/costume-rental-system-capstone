import React from "react";
import Image from "next/image";
import SmokeCircles from "@/features/landing-page/components/SmokeCircles";
import Reveal from "./Reveal";

export default function Hero() {
  return (
    <>
    <Reveal>
      <section
        id="home"
        className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 md:px-6"
      >
        <div className="relative flex justify-center h-[calc(95svh-5rem)] w-full flex-col items-center">
          <Image
            src="/assets/images/landing-page/hero-bg.jpg"
            alt="Wedding and formal outfits on hangers"
            fill
            priority
            className="object-cover rounded-xl duration-500 ease-out"
          />
          <div className="absolute inset-0 rounded-xl" />
          <SmokeCircles className="rounded-xl" />

          <div className="relative z-10 flex w-full flex-col items-center justify-start px-4 text-center md:px-12">
            <h1 className="max-w-4xl text-6xl leading-[1.08] font-bold text-white sm:text-5xl md:text-6xl lg:text-8xl">
              Find the <span className="text-primary">Perfect Outfit</span> for
              Every Occasion
            </h1>
          </div>
        </div>
      </section>
{/* 
      <div className="relative z-40 mx-auto -mt-[calc(100svh_-_29rem)] flex w-full max-w-7xl justify-center px-4 sm:-mt-[calc(100svh_-_31rem)] md:-mt-[calc(100svh_-_33rem)] md:px-6 lg:-mt-[calc(100svh_-_35rem)]">
        <Image
          src="/assets/images/landing-page/hero-gown.png"
          alt="Blue layered gown"
          width={420}
          height={420}
          className="h-auto w-[340px] sm:w-[420px] md:w-[500px] lg:w-[550px]"
        />
      </div> */}
      </Reveal>
    </>
  );
}
