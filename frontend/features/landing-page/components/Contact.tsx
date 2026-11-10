import React from "react";
import {Clock3, ExternalLink, Globe, MapPin} from "lucide-react";
import SectionHeader from "@/features/landing-page/components/SectionHeader";
import SmokeCircles from "@/features/landing-page/components/SmokeCircles";
import {contactData, facebookUrl} from "@/features/landing-page/data";

export default function Contact() {
  return (
    <section
      id="contacts"
      className="relative scroll-mt-24 overflow-hidden bg-[#f8f4fb] py-16 md:py-24"
    >
      <SmokeCircles />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 md:px-6">
        <SectionHeader
          title={contactData.title}
          description={contactData.description}
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-xl bg-white p-8 shadow-[0_20px_60px_rgba(102,50,135,0.08)] md:p-10">
            <h3 className="text-3xl font-semibold text-[#663287] md:text-[2rem]">
              {contactData.heading}
            </h3>
            <p className="mt-4 max-w-[32rem] text-lg leading-relaxed text-[#616161]">
              {contactData.body}
            </p>

            <div className="mt-8 space-y-4 text-[#2f2f2f]">
              <div className="flex items-center gap-3 rounded-xl border border-[#efe3f6] bg-[#fcf8ff] p-4">
                <Clock3 size={18} />
                <span>{contactData.hours}</span>
              </div>

              {contactData.locations.map((location) => (
                <div
                  key={location.name}
                  className="flex items-start gap-3 rounded-xl border border-[#efe3f6] bg-[#fcf8ff] p-4"
                >
                  <MapPin size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{location.name}</p>
                    <p className="mt-1 text-sm text-[#7a7a7a]">
                      {location.place} · {location.address}
                    </p>
                    <a
                      href={location.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#6d3c8e] transition-colors hover:text-[#542c6d]"
                    >
                      Open in Google Maps
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              ))}

              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-[#efe3f6] bg-[#fcf8ff] p-4 transition-colors hover:border-[#d8c8e4]"
              >
                <Globe size={18} />
                <span>Message us on Facebook</span>
              </a>
            </div>
          </div>

          <div className="grid gap-6">
            {contactData.locations.map((location) => (
              <div
                key={location.name}
                className="overflow-hidden rounded-xl border border-[#efe3f6] bg-white shadow-[0_20px_60px_rgba(102,50,135,0.08)]"
              >
                <div className="flex items-center justify-between gap-3 border-b border-[#efe3f6] px-4 py-3">
                  <p className="font-medium text-[#2f2f2f]">{location.name}</p>
                  <a
                    href={location.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#6d3c8e] transition-colors hover:text-[#542c6d]"
                  >
                    Open map
                    <ExternalLink size={14} />
                  </a>
                </div>
                <iframe
                  src={location.mapEmbed}
                  width="100%"
                  height="100%"
                  className="min-h-[18rem] w-full md:min-h-[20rem]"
                  style={{border: 0}}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title={`${location.place} location`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
