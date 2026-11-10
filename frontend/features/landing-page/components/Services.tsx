import React from "react";
import SmokeCircles from "@/features/landing-page/components/SmokeCircles";
import {servicesData} from "@/features/landing-page/data";

export default function Services() {
  return (
    <section
      id="services"
      className="relative scroll-mt-24 overflow-hidden py-20 md:py-28"
    >
      <SmokeCircles />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 md:px-6">
        <header className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold text-[#6d3c8e] md:text-5xl">
            {servicesData.title}
          </h2>
          <p className="mx-auto mt-6 max-w-4xl text-lg leading-relaxed text-[#616161] md:text-xl md:leading-[1.5]">
            {servicesData.description}
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {servicesData.items.map((service) => {
            const Icon = service.icon;

            return (
              <article
                key={service.title}
                className="group rounded-xl bg-[#f4f1f7] p-10 transition-colors duration-300 hover:bg-[#6f3f8f]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#6f3f8f]">
                  <Icon size={26} strokeWidth={2} />
                </div>

                <h3 className="mt-8 text-2xl font-semibold text-[#2b2b2b] transition-colors duration-300 group-hover:text-white">
                  {service.title}
                </h3>

                <p className="mt-3 text-base leading-relaxed text-[#6b6b6b] transition-colors duration-300 group-hover:text-white/85">
                  {service.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
