import type {ComponentType, ReactNode} from "react";
import {cn} from "@/lib/utils";

interface AdminPageTitleProps {
  icon: ComponentType<{className?: string}>;
  children: ReactNode;
  className?: string;
}

/** Canonical admin page title: icon + 2xl bold heading, one place only. */
export function AdminPageTitle({icon: Icon, children, className}: AdminPageTitleProps) {
  return (
    <h1
      className={cn(
        "flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground",
        className,
      )}
    >
      <Icon className="size-6 shrink-0 text-foreground" />
      {children}
    </h1>
  );
}

interface AdminPageHeaderProps {
  title: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * Sticky page header shared by every admin tab so the title and the primary
 * controls (date slicer, add, export) line up identically across the section.
 *
 * The layout's `main` must not be a scroll container (no `overflow-*`), otherwise
 * `sticky` resolves against `main` - which never scrolls - and the header
 * silently fails to stick. The viewport is the scrollport.
 *
 * `-mx-6 px-6` bleeds the blurred background out to the edges of the layout's
 * `p-6` wrapper so rows scrolling underneath don't peek through the gutters.
 * There is intentionally no bottom border: the blur/background alone separates
 * the bar from the content.
 *
 * The extra mobile `pl` keeps the title clear of the fixed sidebar menu button,
 * which is pinned to the top-left corner below the `md` breakpoint.
 */
export function AdminPageHeader({title, actions, className}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-30 -mx-6 flex flex-col gap-3 bg-background/95 px-6 py-3 pl-[4.5rem] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:pl-6",
        className,
      )}
    >
      <div className="min-w-0">{title}</div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
