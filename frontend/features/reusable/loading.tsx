import Image from "next/image";

import coloredLogo from "@/assets/business-logo/logo-only-colored.png";
import {cn} from "@/lib/utils";

interface FullScreenLoaderProps {
  label?: string;
  subcaption?: string;
  className?: string;
}

export default function Loading({
  label = "Loading",
  subcaption = "Just a moment while we set things up.",
  className,
}: FullScreenLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "brand-theme fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-background px-6 text-center",
        className,
      )}
    >
      <Image
        src={coloredLogo}
        alt="Morena"
        priority
        className="size-24 object-contain motion-safe:animate-pulse"
      />

      <div className="space-y-1.5">
        <p className="text-sm font-medium tracking-wide text-foreground">
          {label}
        </p>
        <p className="text-sm text-muted-foreground">{subcaption}</p>
      </div>

      <span className="sr-only">Content is loading, please wait.</span>
    </div>
  );
}
