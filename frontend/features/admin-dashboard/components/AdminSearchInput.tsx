"use client";

import {Search, X} from "lucide-react";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";

interface AdminSearchInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange"> {
  value: string;
  onValueChange: (value: string) => void;
  /** Applied to the wrapper so callers can control the field's width. */
  wrapperClassName?: string;
}

/**
 * The single admin search field. Every admin list (payments, reviews,
 * inventory, and the outfit pickers inside the package/bundle modals) renders
 * this so the icon inset, height, clear affordance and focus treatment are
 * identical everywhere.
 */
export function AdminSearchInput({
  value,
  onValueChange,
  wrapperClassName,
  className,
  placeholder = "Search…",
  ...props
}: AdminSearchInputProps) {
  return (
    <div className={cn("relative min-w-0 flex-1", wrapperClassName)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className={cn("h-9 w-full pr-9 pl-9", className)}
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onValueChange("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-1.5 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
