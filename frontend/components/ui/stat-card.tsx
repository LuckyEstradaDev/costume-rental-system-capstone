import type {ReactNode} from "react";
import type {LucideIcon} from "lucide-react";
import {ArrowDownRight, ArrowUpRight, Minus} from "lucide-react";

import {Card} from "@/components/ui/card";
import {cn} from "@/lib/utils";

/**
 * Comparison against the preceding equal-length window.
 * `percent === null` means there is no meaningful baseline (no prior data, or
 * prior data of zero) — the card says so rather than showing a fake number.
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
}: StatCardProps) {
  return (
    <Card
      aria-busy={ariaBusy}
      className={cn(
        "h-28 gap-0 rounded-lg border border-border bg-card p-5 transition-colors hover:border-border/80",
        className,
      )}
    >
      <div className="flex h-full items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p
            className={cn(
              "mt-2 break-words text-2xl font-bold tracking-tight text-foreground tabular-nums",
              valueClassName,
            )}
          >
            {value}
          </p>
          {delta || hint ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              {delta ? <DeltaBadge delta={delta} /> : null}
              {hint ? (
                <span className="text-[11px] font-normal text-muted-foreground">
                  {hint}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        {Icon ? (
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
