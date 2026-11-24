import Image from "next/image";
import React from "react";
import AboutStats from "@/features/landing-page/components/AboutStats";
import Reveal from "@/features/landing-page/components/Reveal";
import {aboutUsData} from "@/features/landing-page/data";

// Alternate tilt on the photos, like pinned prints.
const IMAGE_TILTS = ["-rotate-1", "rotate-1"];

export default function About() {
  return (
    <section id="about" className="scroll-mt-24 bg-white py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <Reveal>
          <header className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-semibold text-primary md:text-5xl">
              {aboutUsData.title}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {aboutUsData.description}
            </p>
          </header>
        </Reveal>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <Reveal>
            <article>
              <h3 className="max-w-[34rem] text-3xl leading-tight font-semibold text-primary md:text-4xl">
                {aboutUsData.heading}
              </h3>
              <p className="mt-5 max-w-[42rem] text-lg leading-relaxed text-muted-foreground">
                {aboutUsData.body}
              </p>

              <AboutStats />
            </article>
          </Reveal>

          <div className="grid grid-cols-2 gap-5">
            {aboutUsData.images.map((image, index) => (
              <Reveal key={image.alt} delay={index * 100}>
                <div
                  className={`relative overflow-hidden rounded-xl ${
                    index === 0 ? "h-[26rem]" : "mt-10 h-[22rem]"
                  } ${IMAGE_TILTS[index % 2]}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 30vw"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}