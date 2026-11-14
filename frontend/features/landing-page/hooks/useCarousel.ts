"use client";

import {
  type FocusEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type UseCarouselOptions = {
  itemCount: number;
  /** Enables autoplay when the slides overflow. Omit for manual-only carousels. */
  autoScrollMs?: number;
};

export function useCarousel({itemCount, autoScrollMs}: UseCarouselOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
  }, []);

  const checkOverflow = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    setIsOverflowing(container.scrollWidth > container.clientWidth + 2);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(container);
    Array.from(container.children).forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [checkOverflow, itemCount]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const updateVisibility = () => setIsDocumentVisible(!document.hidden);

    document.addEventListener("visibilitychange", updateVisibility);

    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  const scroll = useCallback(
    (direction: 1 | -1) => {
      const container = containerRef.current;
      if (!container) return;

      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) return;

      const slide = container.querySelector<HTMLElement>(
        "[data-carousel-slide]",
      );
      const styles = window.getComputedStyle(container);
      const gap = Number.parseFloat(styles.columnGap) || 0;
      const step = slide ? slide.offsetWidth + gap : container.clientWidth;
      const behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";

      if (direction === 1) {
        if (container.scrollLeft >= maxScroll - 1) {
          container.scrollTo({left: 0, behavior});
        } else {
          container.scrollBy({left: step, behavior});
        }
      } else if (container.scrollLeft <= 1) {
        container.scrollTo({left: maxScroll, behavior});
      } else {
        container.scrollBy({left: -step, behavior});
      }
    },
    [prefersReducedMotion],
  );

  useEffect(() => {
    if (
      !autoScrollMs ||
      !isOverflowing ||
      isAutoPaused ||
      isInteracting ||
      !isDocumentVisible ||
      prefersReducedMotion
    ) {
      return;
    }

    const interval = window.setInterval(() => scroll(1), autoScrollMs);
    return () => window.clearInterval(interval);
  }, [
    autoScrollMs,
    isOverflowing,
    isAutoPaused,
    isInteracting,
    isDocumentVisible,
    prefersReducedMotion,
    scroll,
  ]);

  const pause = useCallback(() => setIsInteracting(true), []);
  const resume = useCallback(() => setIsInteracting(false), []);
  const toggleAutoPause = useCallback(
    () => setIsAutoPaused((paused) => !paused),
    [],
  );

  const handleBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget;

    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
      setIsInteracting(false);
    }
  }, []);

  return {
    setContainerRef,
    isOverflowing,
    isAutoPaused,
    prefersReducedMotion,
    toggleAutoPause,
    previous: () => scroll(-1),
    next: () => scroll(1),
    interactionHandlers: {
      onMouseEnter: pause,
      onMouseLeave: resume,
      onFocus: pause,
      onBlur: handleBlur,
      onPointerDown: pause,
      onPointerUp: resume,
      onTouchStart: pause,
      onTouchEnd: resume,
    },
  };
}
