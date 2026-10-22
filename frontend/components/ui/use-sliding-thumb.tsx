"use client";

import {useLayoutEffect, useRef, useState} from "react";

export type SlidingThumbState = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * Measures the active segment so the track's fill can slide to it.
 *
 * The fill is a single element behind the buttons, so picking another option
 * is one movement instead of a repaint of every button. The numbers come from
 * the rendered boxes rather than `offsetLeft`, so they are measured from the
 * track's padding edge - which is where an absolutely positioned fill starts.
 *
 * The measurement runs in a layout effect, so the fill is in place before the
 * first paint and the transition only plays when the active option changes.
 */
export function useSlidingThumb(activeValue: string) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<SlidingThumbState | null>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const active = track.querySelector<HTMLElement>(
      '[data-segmented-active="true"]',
    );
    // Every usage always has exactly one active option, so the last
    // measurement stays valid until the next one replaces it.
    if (!active) return;

    const measure = () => {
      const trackBox = track.getBoundingClientRect();
      const activeBox = active.getBoundingClientRect();

      setThumb({
        left: activeBox.left - trackBox.left - track.clientLeft,
        top: activeBox.top - trackBox.top - track.clientTop,
        width: activeBox.width,
        height: activeBox.height,
      });
    };

    measure();

    // The fill has to follow the option it stands for, so it re-measures when
    // the track or the option changes size: a longer label, a count that
    // gains a digit, the window being resized.
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    observer.observe(active);

    return () => observer.disconnect();
  }, [activeValue]);

  return {trackRef, thumb};
}

/** The fill that slides along the track to sit behind the active option. */
export function SlidingThumb({thumb}: {thumb: SlidingThumbState}) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute z-0 rounded-full bg-primary transition-[left,top,width,height] duration-300 ease-out motion-reduce:transition-none"
      style={{
        left: thumb.left,
        top: thumb.top,
        width: thumb.width,
        height: thumb.height,
      }}
    />
  );
}
