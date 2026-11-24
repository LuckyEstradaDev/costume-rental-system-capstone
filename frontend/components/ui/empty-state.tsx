import type {LucideIcon} from "lucide-react";
import {cn} from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  className?: string;
};

export function EmptyState({icon: Icon, title, className}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 px-4 py-12 text-center",
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-8 text-muted-foreground/70" strokeWidth={1.5} />
      <p className="text-[1.375rem] font-semibold text-muted-foreground">{title}</p>
    </div>
  );
}
