import {Star} from "lucide-react";

import {cn} from "@/lib/utils";

type StarRatingSize = "sm" | "md";

const sizeClasses: Record<StarRatingSize, string> = {
  sm: "size-3.5",
  md: "size-4",
};

export function StarRating({
  value,
  max = 5,
  size = "sm",
  className,
}: {
  value: number;
  max?: number;
  size?: StarRatingSize;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${value} out of ${max} stars`}
      className={cn("flex items-center gap-0.5", className)}
    >
      {Array.from({length: max}).map((_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={cn(
            sizeClasses[size],
            index < Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted",
          )}
        />
      ))}
    </div>
  );
}
