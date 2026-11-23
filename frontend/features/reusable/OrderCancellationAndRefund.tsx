import {Card} from "@/components/ui/card";
import {formatReadableDateTime} from "@/lib/formatters";
import {cn} from "@/lib/utils";

interface OrderCancellationAndRefundProps {
  open?: boolean;
  cancelledAt?: Date | string;
  isRefunded: boolean;
  refundedAt?: Date | string;
}

export function OrderCancellationAndRefund({
  open = false,
  cancelledAt,
  isRefunded,
  refundedAt,
}: OrderCancellationAndRefundProps) {
  if (!cancelledAt && !isRefunded) return null;

  const Surface = open ? "section" : Card;
  const dates = [{title: "Cancellation", date: cancelledAt}];
  if (isRefunded) dates.push({title: "Refunded", date: refundedAt});

  return (
    <div className={cn("grid", open ? "gap-8 md:gap-12" : "gap-3 sm:gap-6", isRefunded && (open ? "sm:grid-cols-2" : "grid-cols-2"))}>
      {dates.map(({title, date}) => {
        const timestamp = date ? new Date(date) : null;
        return (
          <Surface
            key={title}
            className={cn("min-w-0", !open && "gap-0 rounded-lg border border-border/50 bg-background p-4 sm:p-5 md:p-6")}
          >
            <h2 className="text-lg font-semibold text-primary md:text-xl">{title}</h2>
            <p className="mt-3 text-sm text-secondary">
              {timestamp && Number.isFinite(timestamp.getTime()) ? (
                <time dateTime={timestamp.toISOString()}>{formatReadableDateTime(timestamp)}</time>
              ) : "Date unavailable"}
            </p>
          </Surface>
        );
      })}
    </div>
  );
}
