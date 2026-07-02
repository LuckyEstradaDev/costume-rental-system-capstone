import React from "react";
import {Camera, Globe, Music2, Phone, Mail, MapPin} from "lucide-react";
import {footerData} from "@/features/landing-page/data";

const socialIcons = {
  Facebook: Globe,
  Instagram: Camera,
  TikTok: Music2,
};

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#2b1c36] pt-16 pb-8 text-white">
      {/* ambient glow */}
      <div className="pointer-events-none absolute top-[-10rem] left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[#8a4fb0] opacity-20 blur-[100px]" />

      <div className="relative mx-auto max-w-[100rem] px-6 md:px-9">
        <div className="grid grid-cols-1 gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <p className="text-4xl font-semibold tracking-wide text-[#dfb8ff]">
              {footerData.brand}
            </p>
            <p className="mt-4 max-w-[28rem] text-lg leading-relaxed text-white/70">
              {footerData.tagline}
            </p>

            <div className="mt-8 space-y-3 text-sm text-white/70 md:text-base flex flex-col gap-2">
              <p className="inline-flex items-center gap-2">
                <Phone size={16} className="text-[#dfb8ff]" />
                {footerData.contact.phone}
              </p>
              <p className="inline-flex items-center gap-2">
                <Mail size={16} className="text-[#dfb8ff]" />
                {footerData.contact.email}
              </p>
              <p className="inline-flex items-center gap-2">
                <MapPin size={16} className="text-[#dfb8ff]" />
                {footerData.contact.address}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {footerData.sections.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold tracking-[0.12em] text-white uppercase">
                  {section.title}
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm text-white/55 md:text-base">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="transition-colors hover:text-[#dfb8ff]"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 text-sm text-white/50 md:flex-row md:items-center">
          <p>{footerData.copyright}</p>

          <div className="flex items-center gap-3">
            {footerData.socials.map((social) => {
              const Icon = socialIcons[social as keyof typeof socialIcons];
              if (!Icon) return null;

              return (
                <a
                  key={social}
                  href="#"
                  aria-label={social}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/80
                             transition-all hover:bg-[#dfb8ff]/15 hover:text-[#dfb8ff]"
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
