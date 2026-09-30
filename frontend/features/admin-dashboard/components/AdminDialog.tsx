import type {ComponentType, ReactNode} from "react";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {cn} from "@/lib/utils";

/** One width ladder for every admin modal. */
export const ADMIN_DIALOG_WIDTHS = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
} as const;

export type AdminDialogWidth = keyof typeof ADMIN_DIALOG_WIDTHS;

interface AdminDialogContentProps
  extends React.ComponentProps<typeof DialogContent> {
  width?: AdminDialogWidth;
}

/**
 * The shared admin modal shell. Every admin dialog uses this so the frame,
 * scroll behaviour and height cap are identical; only the width varies by how
 * much content the form holds.
 */
export function AdminDialogContent({
  width = "md",
  className,
  ...props
}: AdminDialogContentProps) {
  return (
    <DialogContent
      className={cn(
        "flex max-h-[90vh] flex-col gap-0 overflow-hidden rounded-xl p-0",
        ADMIN_DIALOG_WIDTHS[width],
        className,
      )}
      {...props}
    />
  );
}

interface AdminDialogHeaderProps {
  title: string;
  description?: string;
  icon?: ComponentType<{className?: string}>;
  className?: string;
  children?: ReactNode;
}

/** Shared dialog header: icon tile, title, optional description, hairline rule. */
export function AdminDialogHeader({
  title,
  description,
  icon: Icon,
  className,
  children,
}: AdminDialogHeaderProps) {
  return (
    <DialogHeader
      className={cn(
        "shrink-0 flex-row items-start gap-3 border-b border-border/60 bg-background px-6 py-4 pr-14",
        className,
      )}
    >
      {Icon ? (
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
        {description ? (
          <DialogDescription className="mt-1 text-xs">
            {description}
          </DialogDescription>
        ) : null}
      </div>
      {children}
    </DialogHeader>
  );
}

type AdminDialogBodyProps = React.ComponentProps<"div">;

/** Shared scrollable dialog body. */
export function AdminDialogBody({className, ...props}: AdminDialogBodyProps) {
  return (
    <div
      className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-5", className)}
      {...props}
    />
  );
}

type AdminDialogFooterProps = React.ComponentProps<typeof DialogFooter>;

/** Shared dialog footer: full-bleed hairline rule with right-aligned actions. */
export function AdminDialogFooter({className, ...props}: AdminDialogFooterProps) {
  return (
    <DialogFooter
      className={cn(
        "mx-0 mb-0 shrink-0 gap-2 border-t border-border/60 bg-background px-6 py-4 sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}
