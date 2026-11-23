import type {ReactNode} from "react";
import {cn} from "@/lib/utils";

export function OrderDetailPanel({
  title,
  children,
  wide = false,
  singleColumn = false,
  className,
}: {
  title: string;
  children: ReactNode;
  wide?: boolean;
  singleColumn?: boolean;
  className?: string;
}) {
  return (
    <section className={cn("min-w-0 rounded-lg border border-border/50 bg-background p-5 md:p-6", className)}>
      <h2 className="mb-5 text-xl font-semibold text-primary md:text-2xl">{title}</h2>
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
      <dt className="min-w-0 max-w-[45%] break-words text-sm text-secondary/70">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 break-words text-right text-base font-medium leading-relaxed text-secondary">
        {value}
      </dd>
    </div>
  );
}
