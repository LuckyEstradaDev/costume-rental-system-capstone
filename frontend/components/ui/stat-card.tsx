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
  /** One quiet line saying what the number counts, shown at the bottom. */
  context?: string;
  /**
   * Marks a card whose number needs action (e.g. overdue rentals). A pulsing gold dot marks the card.
   */
  needsAttention?: boolean;
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
  const captionClass = cn("font-normal text-primary-foreground/70", textSize);

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
          "inline-flex items-center gap-0.5 font-medium text-primary-foreground/70",
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
        up ? "text-emerald-300" : "text-red-300",
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
  context,
  needsAttention,
  size = "default",
}: StatCardProps) {
  const isLg = size === "lg";
  // The label names the number, so it stays quiet rather than competing with
  // it. It is clipped to a single line so the title row keeps a fixed height
  // and the number below it stays centred.
  const labelClass = cn(
    "min-w-0 truncate text-primary-foreground/70",
    isLg ? "text-base sm:text-xl" : "text-xs sm:text-[15px]",
    // The line height goes last on purpose: tailwind-merge drops a line
    // height that a font size class comes after, and this row is sized by
    // the label it holds.
    "leading-tight sm:leading-normal",
  );
  // Wide tracking is what makes the number read as the card's hero. The
  // headline card goes a size up again so the hierarchy is obvious at a glance.
  // `leading-tight` keeps the digits optically centred; it goes last for the
  // same reason the label's does.
  const valueClass = cn(
    "break-words font-bold tabular-nums text-primary-foreground",
    isLg
      ? "text-4xl tracking-[0.02em] sm:text-6xl"
      : "text-lg tracking-[0.05em] sm:text-2xl",
    "leading-tight",
  );
  // The title row and the bottom slot are the same height, so the band left
  // over between them is centred in the card and the number lands on the
  // card's middle.
  const rowMinClass = isLg ? "min-h-8" : "min-h-6";
  const iconClass = cn(
    "shrink-0 text-primary-foreground",
    isLg
      ? "[&>svg]:size-5 sm:[&>svg]:size-6"
      : "[&>svg]:size-[18px] sm:[&>svg]:size-5",
  );

  const deltaRow = delta ? <DeltaBadge delta={delta} size={size} /> : null;
  const contextClass = cn(
    "truncate text-primary-foreground/70",
    isLg ? "text-sm" : "text-[11px]",
  );

  if (isLoading) {
    return (
      <Card
        aria-busy={true}
        className={cn(
          "gap-0 rounded-lg border-0 bg-transparent p-0 ring-0 sm:h-32",
          className,
        )}
      >
        <Skeleton className="h-full w-full rounded-lg" />
      </Card>
    );
  }

  return (
    <Card
      aria-busy={isLoading}
      className={cn(
        "gap-0 rounded-lg bg-primary p-3 text-primary-foreground ring-0 sm:h-32 sm:p-5",
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
          {needsAttention ? (
            <span
              role="img"
              aria-label="Needs attention"
              className="ml-auto size-2.5 shrink-0 animate-pulse rounded-full bg-accent motion-reduce:animate-none"
            />
          ) : null}
        </div>

        {/* The number takes the middle of the card's height. */}
        <div
          className={cn(
            "flex flex-1 items-center",
            isLg ? "min-h-12" : "min-h-8",
          )}
        >
          <p className={cn(valueClass, valueClassName)}>{value}</p>
        </div>

        {/* The bottom slot holds the comparison and the one-line context. It
            keeps its height even when empty, so the number stays centred. */}
        <div
          className={cn(
            rowMinClass,
            "flex flex-wrap items-center gap-x-2 pt-1 sm:pt-1.5",
          )}
        >
          {deltaRow}
          {context ? <span className={contextClass}>{context}</span> : null}
        </div>
      </div>
    </Card>
  );
}