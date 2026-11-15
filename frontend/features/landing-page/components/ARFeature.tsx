import Image from "next/image";
import Link from "next/link";
import {ArrowRight} from "lucide-react";

import {Button} from "@/components/ui/button";
import Reveal from "@/features/landing-page/components/Reveal";
import {arFeatureData} from "@/features/landing-page/data";

export default function ARFeature() {
  return (
    <section id="ar" className="scroll-mt-24 bg-secondary py-16 md:py-24">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <h2 className="text-4xl font-semibold text-white md:text-5xl">
            {arFeatureData.title} with our <span className="text-accent">AR Virtual Try-On</span>
          </h2>

          <p className="mt-5 max-w-md text-lg leading-relaxed text-white/75">
            {arFeatureData.description}
          </p>

          <Button
            asChild
            size="lg"
            
            className="mt-8 h-12 gap-2 px-6 bg-accent text-primary hover:bg-accent-hover focus:ring-accent/50"
          >
            <Link href="/dashboard/browse">
              {arFeatureData.ctaText}
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-xl lg:ml-auto">
            <Image
              src="/assets/images/landing-page/gown.jpg"
              alt="Gown available for AR virtual try-on"
              fill
              sizes="(max-width: 768px) 100vw, 28rem"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}