import Image from "next/image";
import Link from "next/link";

import {Button} from "@/components/ui/button";
import Reveal from "@/features/landing-page/components/Reveal";
import {arFeatureData} from "@/features/landing-page/data";

export default function ARFeature() {
  return (
    <section id="ar" className="scroll-mt-24 bg-[#f8f4fb] py-16 md:py-24">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 md:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <Reveal>
          <p className="text-sm font-semibold tracking-[0.18em] text-[#6d3c8e] uppercase">
            {arFeatureData.eyebrow}
          </p>

          <h2 className="mt-4 text-4xl font-semibold text-[#6d3c8e] md:text-5xl">
            {arFeatureData.title}
          </h2>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#5e5e5e] md:text-xl">
            {arFeatureData.description}
          </p>

          <ul className="mt-8 border-t border-[#e6d7ef]">
            {arFeatureData.highlights.map((highlight, index) => (
              <li
                key={highlight.title}
                className="flex gap-5 border-b border-[#e6d7ef] py-4"
              >
                <span className="pt-0.5 text-sm font-semibold text-[#6d3c8e]">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-[#2b2b2b]">
                    {highlight.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#616161]">
                    {highlight.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Button asChild size="lg" className="px-5">
              <Link href="/dashboard/browse">{arFeatureData.ctaText}</Link>
            </Button>
            <p className="mt-3 text-sm text-[#6b6b6b]">
              Available on selected outfits with a 3D model.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl ring-1 ring-black/5">
            <Image
              src="/assets/images/landing-page/gown.jpg"
              alt="Gown available for AR virtual try-on"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-5 pt-16 pb-5 text-white">
              <p className="text-sm font-semibold">Live AR preview</p>
              <p className="mt-1 text-xs text-white/75">
                Camera try-on and fit check for selected outfits.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
