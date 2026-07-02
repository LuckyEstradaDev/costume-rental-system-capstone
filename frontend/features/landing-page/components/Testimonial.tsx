import React from "react";
import {BadgeCheck, ChevronDown, Quote} from "lucide-react";
import {testimonialsData} from "@/features/landing-page/data";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Testimonial() {
  return (
    <section id="reviews" className="scroll-mt-24 bg-[#faf8fb] py-20 md:py-28">
      <div className="mx-auto max-w-[100rem] px-6 md:px-9">
        <header className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold text-[#6d3c8e] md:text-5xl">
            {testimonialsData.title}
          </h2>
          <p className="mx-auto mt-6 max-w-4xl text-lg leading-relaxed text-[#616161] md:text-xl md:leading-[1.5]">
            {testimonialsData.description}
          </p>
        </header>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {testimonialsData.items.map((item, index) => (
            <article
              key={`${item.name}-${index}`}
              className="relative overflow-hidden rounded-[28px] border border-black/[0.04] bg-white p-6
                         shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_24px_-8px_rgba(109,60,142,0.12)]
                         transition-transform duration-300 hover:-translate-y-1"
            >
              <Quote
                size={72}
                className="pointer-events-none absolute -top-2 -right-2 text-[#6d3c8e]/[0.05]"
                fill="currentColor"
              />

              <div className="relative flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4dd2d3] to-[#6d3c8e] text-sm font-semibold text-white">
                  {getInitials(item.name)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#2b2b2b]">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#9a9a9a]">{item.handle}</p>
                </div>
              </div>

              <div className="relative mt-3 flex items-center gap-2">
                <p className="text-xs font-medium text-[#f0b429]">
                  {item.rating}
                </p>
                <span className="inline-flex items-center gap-1 rounded-md bg-[#ecfff4] px-2 py-0.5 text-[10px] font-semibold text-[#2d8f60]">
                  <BadgeCheck size={11} />
                  {item.verified}
                </span>
              </div>

              <p className="relative mt-4 border-l-2 border-[#e7dcee] pl-3 text-sm leading-relaxed text-[#4f4f4f]">
                {item.message}
              </p>

              <button className="relative mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#6d3c8e]">
                Show more <ChevronDown size={14} />
              </button>

              <p className="relative mt-4 border-t border-[#f0eaf3] pt-3 text-[10px] text-[#b0b0b0]">
                {item.date}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
