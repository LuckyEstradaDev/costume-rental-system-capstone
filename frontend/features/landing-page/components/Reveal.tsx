"use client";

import {useEffect, useRef, useState, type ComponentProps} from "react";

import {cn} from "@/lib/utils";

type RevealProps = ComponentProps<"div"> & {
  /** Stagger in milliseconds, for revealing siblings in sequence. */
  delay?: number;
};

/** Fades and lifts its children into view the first time they are scrolled to. */
export default function Reveal({
  className,
  delay = 0,
  style,
  children,
  ...props
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      requestAnimationFrame(() => setIsVisible(true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {threshold: 0.15, rootMargin: "0px 0px -8% 0px"},
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-visible={isVisible}
      style={{
        ...style,
        transitionDelay: delay > 0 ? `${delay}ms` : undefined,
      }}
      className={cn(
        "translate-y-6 opacity-0 transition-[opacity,transform] duration-700 ease-out",
        "data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100",
        "motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
