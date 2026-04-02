import React from "react";
import {BadgeCheck, ChevronDown} from "lucide-react";
import {testimonialsData} from "@/features/landing-page/data";

export default function Testimonial() {
  return (
    <section className="pb-20 md:pb-28">
      <div className="mx-auto max-w-[100rem] px-6 md:px-9">
        <header className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold text-[#6d3c8e] md:text-5xl">
            {testimonialsData.title}
          </h2>
          <p className="mx-auto mt-6 max-w-4xl text-lg leading-relaxed text-[#616161] md:text-xl md:leading-[1.5]">
            {testimonialsData.description}
          </p>
        </header>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {testimonialsData.items.map((item, index) => (
            <article
              key={`${item.name}-${index}`}
              className="rounded-[30px] bg-white p-5 shadow-[0_2px_0_rgba(0,0,0,0.15),0_10px_20px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#4dd2d3] to-[#6d3c8e] text-sm font-semibold text-white">
                  SP
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#2b2b2b]">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#8d8d8d]">{item.handle}</p>
                  <p className="mt-1 text-xs text-[#f0b429]">{item.rating}</p>
                </div>
              </div>

              <p className="mt-3 inline-flex items-center gap-1 rounded-md bg-[#ecfff4] px-2 py-1 text-[10px] font-semibold text-[#2d8f60]">
                <BadgeCheck size={12} />
                {item.verified}
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[#4f4f4f]">
                {item.message}
              </p>

              <button className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#3b3b3b]">
                Show more <ChevronDown size={14} />
              </button>

              <p className="mt-4 border-t border-[#eaeaea] pt-2 text-[10px] text-[#9a9a9a]">
                {item.date}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
