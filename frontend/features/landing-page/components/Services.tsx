import React from "react";
import {servicesData} from "@/features/landing-page/data";

export default function Services() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-[100rem] px-6 md:px-9">
        <header className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold text-[#6d3c8e] md:text-5xl">
            {servicesData.title}
          </h2>
          <p className="mx-auto mt-6 max-w-4xl text-lg leading-relaxed text-[#616161] md:text-xl md:leading-[1.5]">
            {servicesData.description}
          </p>
        </header>

        <div className="mt-8 grid grid-cols-1 items-end gap-5 lg:grid-cols-3">
          {servicesData.items.map((service) => {
            const Icon = service.icon;

            return (
              <article
                key={service.title}
                className="group relative h-[24rem] self-end lg:mt-16 hover:lg:mt-0"
              >
                <div className="absolute inset-x-0 bottom-0 h-[17rem] overflow-hidden rounded-[40px] bg-[#e8e8e8] px-10 py-10 text-[#6f3f8f] transition-all duration-300 group-hover:h-[24rem] group-hover:bg-[#6f3f8f] group-hover:text-white md:px-12">
                  <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-[#f3e9c9] opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:h-52 md:w-52" />

                  <div className="relative z-10">
                    <Icon
                      size={52}
                      strokeWidth={2.2}
                      className="text-[#b4b4b4] transition-colors duration-300 group-hover:text-white"
                    />

                    <h3 className="mt-8 text-5xl font-semibold">
                      {service.title}
                    </h3>

                    <p className="mt-7 max-w-[25rem] max-h-0 overflow-hidden text-xl leading-relaxed text-white/95 opacity-0 transition-all duration-300 group-hover:max-h-48 group-hover:opacity-100">
                      {service.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
