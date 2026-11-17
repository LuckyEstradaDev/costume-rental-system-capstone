"use client";

import {usePathname} from "next/navigation";
import {useEffect} from "react";

function isBrandRoute(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin")
  );
}

export function ThemeScope() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.toggle("brand-theme", isBrandRoute(pathname));
  }, [pathname]);

  return null;
}
