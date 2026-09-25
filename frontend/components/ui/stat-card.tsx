import type {ReactNode} from "react";
import type {LucideIcon} from "lucide-react";

import {Card} from "@/components/ui/card";
import {cn} from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  className?: string;
  valueClassName?: string;
  ariaBusy?: boolean;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  className,
  valueClassName,
  ariaBusy,
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
