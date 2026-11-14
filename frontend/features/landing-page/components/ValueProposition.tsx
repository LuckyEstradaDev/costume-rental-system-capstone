import React from "react";
import Reveal from "@/features/landing-page/components/Reveal";
import {valuePropositionItems} from "@/features/landing-page/data";

export default function ValueProposition() {
  return (
    <section className="mx-auto mt-16 w-full max-w-7xl px-4 md:mt-20 md:px-6">
      <div className="grid w-full grid-cols-2 gap-x-4 gap-y-8 rounded-xl bg-[#f4edf8] px-4 py-8 text-center ring-1 ring-[#e6d7ef] md:grid-cols-2 md:gap-10 md:px-8 md:py-14 lg:grid-cols-4 lg:gap-8">
        {valuePropositionItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <Reveal key={item.title} delay={index * 80}>
              <article className="flex flex-col items-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#7d3e98] text-white md:mb-5 md:h-16 md:w-16">
                  <Icon className="h-7 w-7 md:h-8 md:w-8" strokeWidth={2.4} />
                </div>
                <h3 className="mb-2 text-xl leading-tight font-semibold text-[#7d3e98] md:mb-3 md:text-[2rem]">
                  {item.title}
                </h3>
                <p className="max-w-[19rem] text-sm leading-snug text-[#5c5c5c] md:text-[1.05rem]">
                  {item.description}
                </p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
