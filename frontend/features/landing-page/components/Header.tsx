"use client";

import {Button} from "@/components/ui/button";
import {navItems} from "@/features/landing-page/data";
import Link from "next/link";
import React, {useEffect, useState} from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);

    handleScroll();
    window.addEventListener("scroll", handleScroll, {passive: true});

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-[60] w-full transition-colors duration-300 ${
        isScrolled
          ? "border-b border-border/60 bg-background/95 shadow-sm backdrop-blur-sm motion-safe:animate-[navbar-slide-down_0.25s_ease-out]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <nav className="flex min-h-20 items-center justify-between md:gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-full bg-[#7d3e98]" />
            <span className="text-[30px] font-bold leading-none text-[#703893]">
              Morena
            </span>
          </Link>

          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#7d3e98] text-[#7d3e98] md:hidden"
          >
            <span className="sr-only">Menu</span>
            <span className="space-y-1.5">
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
            </span>
          </button>

          <ul className="hidden flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[14px] text-black md:flex">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="transition-opacity hover:opacity-70"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link href="/login" className="hidden md:inline-flex">
            <Button>Get Started</Button>
          </Link>
        </nav>

        {isMenuOpen && (
          <div className="mt-4 rounded-xl border border-[#d8c8e4] bg-white p-4 md:hidden">
            <ul className="flex flex-col gap-3 text-[14px] text-black">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="block rounded-lg px-2 py-1 transition-colors hover:bg-[#f4edf8]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-4 inline-flex"
              onClick={() => setIsMenuOpen(false)}
            >
              <Button>Get Started</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
