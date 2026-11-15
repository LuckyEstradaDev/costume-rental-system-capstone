import React from "react";
import Link from "next/link";
import {ArrowRight, Clock3, ExternalLink} from "lucide-react";

import {Button} from "@/components/ui/button";
import Reveal from "@/features/landing-page/components/Reveal";
import SmokeCircles from "@/features/landing-page/components/SmokeCircles";
import {contactData, facebookUrl} from "@/features/landing-page/data";

export default function Contact() {
  return (
    <section
      id="contacts"
      className="relative scroll-mt-24 overflow-hidden bg-secondary/5 py-16 md:py-24"
    >
      <SmokeCircles />
      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-4 md:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        <Reveal>
          <h2 className="text-4xl font-semibold text-primary md:text-5xl">
            Visit us in Naic.
          </h2>

          <p className="mt-5 max-w-md text-lg leading-relaxed text-secondary/70">
            {contactData.description}
          </p>

          <p className="mt-6 flex items-center gap-2 text-secondary/70">
            <Clock3 size={22} className="text-secondary" />
            {contactData.hours}
          </p>

          <Button
            asChild
            size="lg"
            className="mt-8 h-12 gap-2 px-6"
          >
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
              Message us on Facebook
              <ArrowRight className="size-5" />
            </a>
          </Button>

          <div className="mt-12 space-y-7">
            {contactData.locations.map((location) => (
              <div key={location.name}>
                <p className="text-xl font-semibold text-primary">
                  {location.name}
                </p>
                <p className="mt-1 text-secondary/70">{location.address}</p>
                <Link
                  href={location.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 font-semibold text-accent underline-offset-4 hover:underline"
                >
                  Get directions
                  <ExternalLink className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="grid gap-6">
          {contactData.locations.map((location, index) => (
            <Reveal key={location.name} delay={index * 100}>
              <iframe
                src={location.mapEmbed}
                className="h-64 w-full rounded-xl md:h-72"
                style={{border: 0}}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title={`${location.name} location`}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}