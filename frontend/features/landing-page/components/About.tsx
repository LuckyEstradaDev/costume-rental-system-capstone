import Image from "next/image";
import React from "react";
import SectionHeader from "@/features/landing-page/components/SectionHeader";
import {aboutUsData} from "@/features/landing-page/data";

export default function About() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[100rem] px-6 md:px-9">
        <SectionHeader
          title={aboutUsData.title}
          description={aboutUsData.description}
        />

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
          <article>
            <h3 className="max-w-[40rem] text-5xl leading-tight font-semibold text-[#663287]">
              {aboutUsData.heading}
            </h3>
            <p className="mt-6 max-w-[42rem] text-lg leading-relaxed text-[#222]">
              {aboutUsData.body}
            </p>

            <div className="mt-12 grid grid-cols-3 gap-6">
              {aboutUsData.stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-5xl font-semibold text-[#6f3a91]">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs tracking-wide text-[#7a7a7a] uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <div className="grid grid-cols-2 gap-5">
            {aboutUsData.images.map((image, index) => (
              <div
                key={image.alt}
                className={`relative overflow-hidden rounded-[40px] ${
                  index === 0 ? "h-[26rem]" : "mt-10 h-[22rem]"
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 30vw"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
