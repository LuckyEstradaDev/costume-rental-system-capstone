"use client";

import {createPortal} from "react-dom";

import {useAdminHeaderSlots} from "@/features/admin-dashboard/components/AdminHeaderSlots";

interface AdminHeaderPortalProps {
  title: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Moves an already-built title and control set into the header's slots.
 *
 * This is the only client part of the header hand-off, and it is split out
 * precisely so that `AdminPageHeader` itself can stay a Server Component.
 * That module is imported by pages on both sides of the RSC boundary: the
 * dashboard and orders pages are `"use client"`, while `reports` and
 * `reservations` are Server Components. Marking `AdminPageHeader` as a client
 * component would force the server pages to hand it a component *reference* -
 * `icon={BarChart3}` - which RSC refuses to serialize, and it would also break
 * the client pages' ability to pass an `onClick` title.
 *
 * Left as a server module, `AdminPageTitle` renders the icon server-side and
 * only the resulting element tree crosses the boundary, which serializes fine.
 */
export function AdminHeaderPortal({
  title,
  description,
  actions,
  className,
}: AdminHeaderPortalProps) {
  const {slots} = useAdminHeaderSlots();

  return (
    <>
      {slots.title
        ? createPortal(
            <div className={className}>
              {title}
              {description ? (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                  {description}
                </p>
              ) : null}
            </div>,
            slots.title,
          )
        : null}
      {slots.actions && actions
        ? createPortal(<div className={className}>{actions}</div>, slots.actions)
        : null}
    </>
  );
}
