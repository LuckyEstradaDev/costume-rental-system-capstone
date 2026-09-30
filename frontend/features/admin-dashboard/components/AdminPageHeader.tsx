import type {ComponentType, ReactNode} from "react";

import {AdminHeaderPortal} from "@/features/admin-dashboard/components/AdminHeaderPortal";
import {cn} from "@/lib/utils";

interface AdminPageTitleProps {
  icon: ComponentType<{className?: string}>;
  children: ReactNode;
  className?: string;
}

/** Canonical admin page title: icon + bold heading, one place only. */
export function AdminPageTitle({icon: Icon, children, className}: AdminPageTitleProps) {
  return (
    <h1
      className={cn(
        "flex items-center gap-2.5 truncate text-lg font-bold tracking-tight text-foreground sm:text-2xl",
        className,
      )}
    >
      <Icon className="size-5 shrink-0 sm:size-6" />
      {children}
    </h1>
  );
}

interface AdminPageHeaderProps {
  title: ReactNode;
  /**
   * One line of context under the title, rendered inside the bar. Kept to a
   * plain string rather than a node so this module can stay a Server
   * Component: a string serializes across the RSC boundary, a rendered element
   * tree would too, but a node holding a component reference would not.
   */
  description?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * The page's contribution to the layout's fixed header.
 *
 * Emits no markup into the page's own flow: the title and the primary controls
 * are handed to `AdminHeaderPortal`, which moves them into the slots that
 * `AdminHeader` provides. A page keeps declaring its own header while the bar -
 * its position, blur, and border - is owned in exactly one place. Because
 * nothing lands in the flow, a page's leading `space-y-6` still resolves
 * against its first real element and no gap opens above the content.
 *
 * Deliberately not a `"use client"` module. This file is imported by admin pages
 * on both sides of the RSC boundary, so it has to be able to resolve as either.
 * See `AdminHeaderPortal` for what breaks if that changes.
 */
export function AdminPageHeader({
  title,
  description,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <AdminHeaderPortal
      title={title}
      description={description}
      actions={actions}
      className={className}
    />
  );
}
