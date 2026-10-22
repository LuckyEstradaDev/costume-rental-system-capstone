import type {ReactNode} from "react";
import {ArrowDownRight, ArrowUpRight, Minus} from "lucide-react";

import {Card} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {cn} from "@/lib/utils";

/**
 * Comparison against the preceding equal-length window.
 * `percent === null` means there is no meaningful baseline (no prior data, or
 * prior data of zero), so the card says so rather than showing a fake number.
 */
export type StatCardDelta = {
  current: number;
  percent: number | null;
  previous: number;
  hasPrevious: boolean;
} | null;

type StatCardProps = {
  label: string;
  value: ReactNode;
  /**
   * The mark that stands for the label, shown to its left. Pass the icon that
   * matches what the number counts.
   */
  icon?: ReactNode;
  className?: string;
  valueClassName?: string;
  /** Swap the number for a pulsing bar while the data is still loading. */
  isLoading?: boolean;
  /** Secondary comparison line, e.g. "vs previous 30 days". */
  delta?: StatCardDelta;
  /**
   * `lg` scales the label, the number, and the delta up for a headline /
   * hierarchy card (e.g. a card spanning several grid rows).
   */
  size?: "default" | "lg";
};

function DeltaBadge({
  delta,
  size = "default",
}: {
  delta: NonNullable<StatCardDelta>;
  size?: "default" | "lg";
}) {
  // Scaled with the card so the caption doesn't read as fine print next to a
  // headline number.
  const textSize = size === "lg" ? "text-sm" : "text-[11px]";
  const iconSize = size === "lg" ? "size-3.5" : "size-3";
  // The card is white, so the caption is the muted grey it is everywhere else.
  const captionClass = cn("font-normal text-muted-foreground", textSize);

  if (!delta.hasPrevious) {
    return <span className={captionClass}>No prior period</span>;
  }

  if (delta.percent === null) {
    return (
      <span className={captionClass}>
        {delta.current > 0 ? "New in this period" : "No change"}
      </span>
    );
  }

  const rounded = Math.round(delta.percent);
  if (rounded === 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 font-medium text-muted-foreground",
          textSize,
        )}
      >
        <Minus className={iconSize} />
        No change
      </span>
    );
  }

  const up = rounded > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-medium",
        textSize,
        // The semantic greens and reds read correctly on a white card.
        up ? "text-emerald-600" : "text-destructive",
      )}
    >
      {up ? (
        <ArrowUpRight className={iconSize} />
      ) : (
        <ArrowDownRight className={iconSize} />
      )}
      {up ? "+" : ""}
      {rounded}% vs prev
    </span>
  );
}

export function StatCard({
  label,
  value,
  icon,
  className,
  valueClassName,
  isLoading,
  delta,
  size = "default",
}: StatCardProps) {
  // The delta is derived from the numbers it sits next to, so it disappears
  // with them instead of quoting a stale percentage beside a skeleton.
  const deltaRow =
    delta && !isLoading ? <DeltaBadge delta={delta} size={size} /> : null;

  const isLg = size === "lg";
  // The label names the number, so it stays quiet rather than competing with
  // it. It is clipped to a single line so the title row keeps a fixed height
  // and the number below it stays centred.
  const labelClass = cn(
    "min-w-0 truncate text-muted-foreground",
    isLg ? "text-base sm:text-xl" : "text-xs sm:text-[15px]",
    // The line height goes last on purpose: tailwind-merge drops a line
    // height that a font size class comes after, and this row is sized by
    // the label it holds.
    "leading-tight sm:leading-normal",
  );
  // Wide tracking is what makes the number read as the card's hero. The app
  // ships Arial, which has no width axis, so spacing is the only lever.
  // `leading-tight` keeps the digits optically centred: in a taller line box
  // the glyphs sit below the middle of the box they are centred in. It goes
  // last for the same reason the label's does.
  const valueClass = cn(
    "break-words font-bold tabular-nums text-foreground",
    isLg
      ? "text-4xl tracking-[0.02em] sm:text-5xl"
      : "text-lg tracking-[0.05em] sm:text-2xl",
    "leading-tight",
  );
  // The title row and the delta slot are the same height, so the band left
  // over between them is centred in the card and the number lands on the
  // card's middle.
  const rowMinClass = isLg ? "min-h-8" : "min-h-6";
  // The mark inherits the card's purple and is sized from here, so the icons
  // keep the same scale across every card whatever the caller passes.
  const iconClass = cn(
    "shrink-0 text-primary",
    isLg
      ? "[&>svg]:size-5 sm:[&>svg]:size-6"
      : "[&>svg]:size-[18px] sm:[&>svg]:size-5",
  );
  // The bar tracks the number it stands in for, so it grows with `size` too.
  const skeletonClass = cn(
    "rounded-md bg-muted",
    isLg ? "h-9 w-20 sm:h-10 sm:w-28" : "h-7 w-16 sm:h-8 sm:w-20",
  );

  return (
    <Card
      aria-busy={isLoading}
      className={cn(
        "gap-0 rounded-lg border-[3px] border-primary bg-white p-3 text-foreground ring-0 sm:h-32 sm:p-5",
        className,
      )}
    >
      <div className="flex h-full flex-col">
        {/* The mark and the label share the title row, above the number. */}
        <div className={cn("flex items-center gap-2", rowMinClass)}>
          {icon ? (
            <span aria-hidden className={iconClass}>
              {icon}
            </span>
          ) : null}
          <p className={labelClass} title={label}>
            {label}
          </p>
        </div>

        {/* The number takes the middle of the card's height. The band keeps a
            floor so the number is never squeezed into its neighbours, even
            when the card has to size itself from its content. */}
        <div
          className={cn(
            "flex flex-1 items-center",
            isLg ? "min-h-12" : "min-h-8",
          )}
        >
          {isLoading ? (
            <Skeleton className={skeletonClass} />
          ) : (
            <p className={cn(valueClass, valueClassName)}>{value}</p>
          )}
        </div>

        {/* The delta owns the bottom of the card. The slot holds its height
            even when there is nothing to show, and matches the title row's
            height, so the number stays centred. */}
        <div className={cn(rowMinClass, "pt-1 sm:pt-1.5")}>{deltaRow}</div>
      </div>
    </Card>
  );
}
