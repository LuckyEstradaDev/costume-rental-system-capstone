"use client";

import Image from "next/image";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {ArrowRight} from "lucide-react";
import React, {useEffect, useState} from "react";

import coloredLogo from "@/assets/business-logo/Colored-logo.png";
import {Button} from "@/components/ui/button";
import {navItems} from "@/features/landing-page/data";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const handleBrandClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") {
      return;
    }

    event.preventDefault();
    window.scrollTo({top: 0, behavior: "smooth"});
  };

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
          ? "bg-background/40 shadow-sm backdrop-blur-sm motion-safe:animate-[navbar-slide-down_0.25s_ease-out]"
          : "bg-transparent"
      }`}
    >
      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6">
        <nav className="flex min-h-20 items-center justify-between md:gap-6">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={handleBrandClick}
          >
            <Image
              src={coloredLogo}
              alt="Morena Gowns and Barongs"
              priority
              className="h-16 w-auto"
            />
          </Link>

          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center text-primary md:hidden"
          >
            <span className="sr-only">Menu</span>
            <span className="space-y-1.5">
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
            </span>
          </button>

          <ul className="hidden flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[14px] text-secondary md:flex lg:gap-x-8">
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

          <Button
            asChild
            size="lg"
            className="hidden h-12 gap-2 px-6 md:inline-flex"
          >
            <Link href="/login">
              Get Started
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        </nav>

        {isMenuOpen && (
          <div className="absolute inset-x-4 top-full z-10 rounded-xl border border-border bg-white p-4 shadow-lg md:hidden">
            <ul className="flex flex-col gap-3 text-[14px] text-secondary">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="block rounded-lg px-2 py-1 transition-colors hover:bg-muted"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Button
              asChild
              size="lg"
              className="mt-4 inline-flex h-12 gap-2 px-6"
            >
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                Get Started
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
