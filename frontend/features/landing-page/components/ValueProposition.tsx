import React from "react";
import Reveal from "@/features/landing-page/components/Reveal";
import {valuePropositionItems} from "@/features/landing-page/data";

export default function ValueProposition() {
  return (
    <section className="mx-auto mt-12 w-full max-w-7xl px-4 md:mt-16 md:px-6">
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 py-6 text-center lg:grid-cols-4 lg:gap-x-6">
        {valuePropositionItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <Reveal key={item.title} delay={index * 60} className="h-full">
              <article className="flex h-full flex-col items-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-white">
                  <Icon className="size-6" strokeWidth={2.2} />
                </div>

                {/* Fixed two-line height below lg so descriptions start on the same line */}
                <h3 className="mt-4 flex min-h-[3rem] items-center text-lg leading-tight font-semibold text-balance text-primary md:text-xl lg:min-h-0">
                  {item.title}
                </h3>

                <p className="mt-2 max-w-[18rem] text-sm leading-snug md:text-base text-balance text-secondary/70">
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