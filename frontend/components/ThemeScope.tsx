"use client";

import {usePathname} from "next/navigation";
import {useEffect} from "react";

function isBrandRoute(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/dashboard")
  );
}

export function ThemeScope() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.toggle("brand-theme", isBrandRoute(pathname));
  }, [pathname]);

  return null;
}
