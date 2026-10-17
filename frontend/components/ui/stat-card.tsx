import type {ReactNode} from "react";
import type {LucideIcon} from "lucide-react";
import {ArrowDownRight, ArrowUpRight, Minus} from "lucide-react";

import {Card} from "@/components/ui/card";
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
  icon?: LucideIcon;
  className?: string;
  valueClassName?: string;
  ariaBusy?: boolean;
  /** Secondary line, e.g. "Right now" or "vs previous 30 days". */
  hint?: string;
  delta?: StatCardDelta;
  /** Stack icon / label / value vertically and center them. */
  centered?: boolean;
};

function DeltaBadge({delta}: {delta: NonNullable<StatCardDelta>}) {
  if (!delta.hasPrevious) {
    return (
      <span className="text-[11px] font-normal text-muted-foreground">
        No prior period
      </span>
    );
  }

  if (delta.percent === null) {
    return (
      <span className="text-[11px] font-normal text-muted-foreground">
        {delta.current > 0 ? "New in this period" : "No change"}
      </span>
    );
  }

  const rounded = Math.round(delta.percent);
  if (rounded === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground">
        <Minus className="size-3" />
        No change
      </span>
    );
  }

  const up = rounded > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-medium",
        up ? "text-emerald-600 dark:text-emerald-500" : "text-destructive",
      )}
    >
      {up ? (
        <ArrowUpRight className="size-3" />
      ) : (
        <ArrowDownRight className="size-3" />
      )}
      {up ? "+" : ""}
      {rounded}% vs prev
    </span>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  className,
  valueClassName,
  ariaBusy,
  hint,
  delta,
  centered,
}: StatCardProps) {
  if (centered) {
    return (
      <Card
        aria-busy={ariaBusy}
        className={cn(
          "gap-0 rounded-lg border border-border bg-card transition-colors hover:border-border/80",
          className,
        )}
      >
        <div className="flex min-h-28 flex-col items-center justify-center gap-1 text-center">
          {Icon ? (
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </div>
          ) : null}
          <p className="text-sm text-muted-foreground">{label}</p>
          <p
            className={cn(
              "break-words text-xl font-bold tracking-tight text-foreground tabular-nums sm:text-2xl",
              valueClassName,
            )}
          >
            {value}
          </p>
          {delta || hint ? (
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
              {delta ? <DeltaBadge delta={delta} /> : null}
              {hint ? (
                <span className="text-[11px] font-normal text-muted-foreground">
                  {hint}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </Card>
    );
  }

  return (
    <Card
      aria-busy={ariaBusy}
      className={cn(
        "gap-0 rounded-lg border border-border bg-card p-3 transition-colors hover:border-border/80 sm:h-28 sm:p-5",
        className,
      )}
    >
      <div className="flex h-full flex-col items-center justify-center gap-1 text-center sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:text-left">
        <div className="min-w-0">
          <p className="text-[11px] leading-tight text-muted-foreground sm:text-sm sm:leading-normal">
            {label}
          </p>
          <p
            className={cn(
              "mt-1 break-words text-lg font-bold tracking-tight text-foreground tabular-nums sm:mt-2 sm:text-2xl",
              valueClassName,
            )}
          >
            {value}
          </p>
          {delta || hint ? (
            <div className="mt-0.5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 sm:mt-1.5 sm:justify-start sm:gap-x-2">
              {delta ? <DeltaBadge delta={delta} /> : null}
              {hint ? (
                <span className="text-[10px] font-normal text-muted-foreground sm:text-[11px]">
                  {hint}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        {Icon ? (
          <div className="order-first grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary sm:order-none sm:size-9">
            <Icon className="size-4" />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
