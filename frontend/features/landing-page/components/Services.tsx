import React from "react";
import Reveal from "@/features/landing-page/components/Reveal";
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
        <Reveal>
          <header className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-semibold text-primary md:text-5xl">
              {servicesData.title}
            </h2>
            <p className="mx-auto mt-6 max-w-4xl text-lg leading-relaxed text-muted-foreground md:text-xl md:leading-[1.5]">
              {servicesData.description}
            </p>
          </header>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:mt-12 lg:grid-cols-3">
          {servicesData.items.map((service, index) => {
            const Icon = service.icon;

            return (
              <Reveal
                key={service.title}
                delay={index * 80}
                className={index === 2 ? "col-span-2 lg:col-span-1" : undefined}
              >
                <article className="group h-full rounded-xl bg-muted p-5 transition-colors duration-300 hover:bg-secondary sm:p-8 lg:p-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary sm:h-14 sm:w-14">
                    <Icon size={26} strokeWidth={2} />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold text-primary transition-colors duration-300 group-hover:text-white sm:mt-8 sm:text-2xl">
                    {service.title}
                  </h3>

                  <p className="mt-2 text-base leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-white/85 sm:mt-3 sm:text-base">
                    {service.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
