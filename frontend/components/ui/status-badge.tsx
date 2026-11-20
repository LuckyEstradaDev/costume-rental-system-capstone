import {Badge} from "@/components/ui/badge";
import {formatStatusLabel} from "@/lib/formatters";
import {getStatusStyle} from "@/lib/statusColors";
import {cn} from "@/lib/utils";

type StatusBadgeProps = {
  status?: string | null;
  type?: "purchase" | "rent";
  className?: string;
};

/**
 * Solid status pill.
 *
 * Known statuses use their mapped accent color (see `lib/statusColors.ts`);
 * unknown or empty statuses fall back to a neutral badge so nothing renders
 * uncolored. All pills share the width of the longest status label.
 */
export function StatusBadge({status, type, className}: StatusBadgeProps) {
  const style = getStatusStyle(status);

  return (
    <Badge
      variant={style ? "outline" : "secondary"}
      style={style}
      className={cn(
        "min-w-24 justify-center",
        style && "border-transparent",
        className,
      )}
    >
      {formatStatusLabel(status, type)}
    </Badge>
  );
}
