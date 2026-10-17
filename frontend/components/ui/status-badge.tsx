import {Badge} from "@/components/ui/badge";
import {formatStatusLabel} from "@/lib/formatters";
import {getStatusStyle} from "@/lib/statusColors";
import {cn} from "@/lib/utils";

type StatusBadgeProps = {
  status?: string | null;
  className?: string;
};

/**
 * Solid status pill.
 *
 * Known statuses use their mapped accent color (see `lib/statusColors.ts`);
 * unknown or empty statuses fall back to a neutral badge so nothing renders
 * uncolored. The pill fits its label exactly.
 */
export function StatusBadge({status, className}: StatusBadgeProps) {
  const style = getStatusStyle(status);

  return (
    <Badge
      variant={style ? "outline" : "secondary"}
      style={style}
      className={cn(style && "border-transparent", className)}
    >
      {formatStatusLabel(status)}
    </Badge>
  );
}
