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
  className?: string;
  valueClassName?: string;
  /** Swap the number for a pulsing bar while the data is still loading. */
  isLoading?: boolean;
  /** Secondary comparison line, e.g. "vs previous 30 days". */
  delta?: StatCardDelta;
  /**
   * Put the delta on the number's line, pushed to the right, instead of under
   * it. For wide cards (e.g. a card spanning several grid columns).
   */
  inlineDelta?: boolean;
  /** Stack label / value vertically and center them. */
  centered?: boolean;
  /**
   * `lg` scales the label, the number, and the delta up for a headline /
   * hierarchy card (e.g. a card spanning several grid rows and columns).
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

  if (!delta.hasPrevious) {
    return (
      <span className={cn("font-normal text-muted-foreground", textSize)}>
        No prior period
      </span>
    );
  }

  if (delta.percent === null) {
    return (
      <span className={cn("font-normal text-muted-foreground", textSize)}>
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
        up ? "text-emerald-600 dark:text-emerald-500" : "text-destructive",
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
  className,
  valueClassName,
  isLoading,
  delta,
  inlineDelta,
  centered,
  size = "default",
}: StatCardProps) {
  // The delta is derived from the numbers it sits next to, so it disappears
  // with them instead of quoting a stale percentage beside a skeleton.
  const deltaRow =
    delta && !isLoading ? <DeltaBadge delta={delta} size={size} /> : null;

  const isLg = size === "lg";
  const labelClass = cn(
    "leading-tight text-muted-foreground sm:leading-normal",
    isLg ? "text-base sm:text-2xl" : "text-sm sm:text-[19px]",
  );
  const valueClass = cn(
    "break-words font-bold tracking-tight text-foreground tabular-nums",
    isLg
      ? "text-3xl sm:text-4xl"
      : centered
        ? "text-xl sm:text-2xl"
        : "text-lg sm:text-2xl",
  );
  // The bar tracks the number it stands in for, so it grows with `size` too.
  const skeletonClass = cn(
    "rounded-md",
    isLg ? "h-9 w-20 sm:h-10 sm:w-28" : "h-7 w-16 sm:h-8 sm:w-20",
  );

  if (centered) {
    return (
      <Card
        aria-busy={isLoading}
        className={cn(
          "gap-0 rounded-lg border border-border bg-card transition-colors hover:border-border/80",
          className,
        )}
      >
        <div className="flex min-h-28 flex-col items-center justify-center gap-1 text-center">
          <p className={cn("text-muted-foreground", labelClass)}>{label}</p>
          {isLoading ? (
            <Skeleton className={skeletonClass} />
          ) : (
            <p className={cn(valueClass, valueClassName)}>{value}</p>
          )}
          {deltaRow ? (
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
              {deltaRow}
            </div>
          ) : null}
        </div>
      </Card>
    );
  }

  const valueNode = <p className={cn(valueClass, valueClassName)}>{value}</p>;

  // Wide cards have the horizontal room, so the delta can share the number's
  // line instead of taking a row of its own underneath it.
  const inline = Boolean(inlineDelta && deltaRow);

  return (
    <Card
      aria-busy={isLoading}
      className={cn(
        "gap-0 rounded-lg border border-border bg-card p-3 transition-colors hover:border-border/80 sm:h-28 sm:p-5",
        className,
      )}
    >
      <div className="flex h-full flex-col items-center justify-center gap-1 text-center sm:items-start sm:text-left">
        <div className="w-full min-w-0">
          <p className={labelClass}>{label}</p>
          {isLoading ? (
            <Skeleton className={cn("mt-1 sm:mt-2", skeletonClass)} />
          ) : inline ? (
            <div className="mt-1 flex w-full flex-wrap items-baseline justify-between gap-x-3 gap-y-1 sm:mt-2">
              {valueNode}
              {deltaRow}
            </div>
          ) : (
            <div className="mt-1 sm:mt-2">{valueNode}</div>
          )}
          {deltaRow && !inline ? (
            <div className="mt-0.5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 sm:mt-1.5 sm:justify-start sm:gap-x-2">
              {deltaRow}
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
