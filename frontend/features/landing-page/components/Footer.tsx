import React from "react";
import Link from "next/link";
import {facebookUrl, footerData, navItems} from "@/features/landing-page/data";

function FacebookIcon({className}: {className?: string}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#2b1c36] pt-16 pb-8 text-white">
      <div className="pointer-events-none absolute top-[-10rem] left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[#8a4fb0] opacity-20 blur-[100px]" />

      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-1 gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-4xl font-semibold tracking-wide text-[#dfb8ff]">
              {footerData.brand}
            </p>
            <p className="mt-4 max-w-[28rem] text-lg leading-relaxed text-white/70">
              {footerData.tagline}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-[0.12em] text-white uppercase">
              Navigation
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm text-white/55 md:text-base">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-[#dfb8ff]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 text-sm text-white/50 md:flex-row md:items-center">
          <p>{footerData.copyright}</p>

          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/80 transition-all hover:bg-[#dfb8ff]/15 hover:text-[#dfb8ff]"
          >
            <FacebookIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
