import type {ComponentType, ReactNode} from "react";
import {cn} from "@/lib/utils";

interface AdminEmptyStateProps {
  icon: ComponentType<{className?: string}>;
  title: string;
  /** Say *why* it is empty and what to do about it - the title alone rarely does. */
  description?: string;
  /** The way out: a clear-search or reset-filters button. */
  action?: ReactNode;
  className?: string;
}

/**
 * The one empty affordance in the admin: full width, icon centred in the middle,
 * a headline and a line of guidance.
 *
 * The height is viewport-relative rather than a `calc` against the header,
 * because the header's height changes per page now that a description can sit
 * under the title. A `60vh` floor fills the page without depending on a value
 * it cannot know.
 *
 * `role="status"` because these appear where a list was expected, so assistive
 * tech should announce the change rather than discover it.
 */
export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: AdminEmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border px-6 py-16 text-center",
        className,
      )}
    >
      <div className="grid size-14 place-items-center rounded-full bg-muted">
        <Icon className="size-6 text-muted-foreground" />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-xs text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
