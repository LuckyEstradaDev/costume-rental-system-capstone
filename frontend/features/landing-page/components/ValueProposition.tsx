import React from "react";
import {valuePropositionItems} from "@/features/landing-page/data";

export default function ValueProposition() {
  return (
    <section className="bg-[#e9e9ea] py-10 md:py-14">
      <div className="mx-auto grid max-w-[100rem] grid-cols-1 gap-10 px-6 text-center md:grid-cols-2 md:px-9 lg:grid-cols-4 lg:gap-8">
        {valuePropositionItems.map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.title} className="flex flex-col items-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#7d3e98] text-white">
                <Icon size={32} strokeWidth={2.4} />
              </div>
              <h3 className="mb-3 text-[2rem] leading-tight font-semibold text-[#7d3e98]">
                {item.title}
              </h3>
              <p className="max-w-[19rem] text-[1.05rem] leading-snug text-[#5c5c5c]">
                {item.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
