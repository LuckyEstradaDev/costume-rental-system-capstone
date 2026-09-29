"use client";

import type {ComponentType} from "react";
import {cn} from "@/lib/utils";

export type AdminSegmentedOption<T extends string> = {
  value: T;
  label: string;
  icon?: ComponentType<{className?: string}>;
  count?: number;
  disabled?: boolean;
  title?: string;
};

interface AdminSegmentedProps<T extends string> {
  options: readonly AdminSegmentedOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** `toolbar` for page-level filters, `sm` for the dense rows inside a popover. */
  size?: "toolbar" | "sm";
  className?: string;
  "aria-label"?: string;
}

/**
 * The one filter idiom in the admin: a pill segmented control with a solid
 * primary active state. Replaces the two competing styles that used to coexist
 * (outlined `secondary` button rows for payment status / date / granularity, and
 * hand-rolled pill rows for inventory view and order type) so every "pick one"
 * control now reads the same.
 */
export function AdminSegmented<T extends string>({
  options,
  value,
  onValueChange,
  size = "toolbar",
  className,
  "aria-label": ariaLabel,
}: AdminSegmentedProps<T>) {
  const dense = size === "sm";

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex w-max gap-1 rounded-full border border-border bg-muted/30 p-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={option.disabled}
            title={option.title}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
              dense ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon ? (
              <Icon
                className={cn(
                  "shrink-0",
                  dense ? "size-3.5" : "size-4",
                  active && "text-primary-foreground",
                )}
              />
            ) : null}
            {option.label}
            {option.count !== undefined ? (
              <span
                className={cn(
                  "tabular-nums",
                  dense ? "text-[10px]" : "text-[11px]",
                  active ? "text-primary-foreground/80" : "text-muted-foreground",
                )}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
