import type {ReactNode} from "react";
import {cn} from "@/lib/utils";

export function OrderDetailPanel({
  title,
  children,
  open = false,
  wide = false,
  singleColumn = false,
  className,
}: {
  title: string;
  children: ReactNode;
  open?: boolean;
  wide?: boolean;
  singleColumn?: boolean;
  className?: string;
}) {
  return (
    <section className={cn("min-w-0", !open && "rounded-lg border border-border/50 bg-background p-5 md:p-6", className)}>
      <h2 className={cn("text-xl font-semibold text-primary md:text-2xl", open ? "mb-4" : "mb-5")}>{title}</h2>
      <dl className={cn("grid grid-cols-1 gap-x-6 gap-y-4", !singleColumn && "sm:grid-cols-2", !singleColumn && wide && "lg:grid-cols-4")}>
        {children}
      </dl>
    </section>
  );
}

export function OrderDetailField({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-baseline justify-between gap-4", className)}>
      <dt className="min-w-0 max-w-[45%] break-words text-sm text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 break-words text-right text-base font-medium leading-relaxed text-secondary">
        {value}
      </dd>
    </div>
  );
}
