import Link from "next/link";
import {Compass, SearchX} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {cn} from "@/lib/utils";

type NotFoundViewProps = {
  code?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  showBrowseAction?: boolean;
  className?: string;
};

export function NotFoundView({
  code = "404",
  title = "Page not found",
  description = "The page you are looking for does not exist or may have been moved.",
  actions,
  showBrowseAction = true,
  className,
}: NotFoundViewProps) {
  return (
    <Card
      className={cn(
        "flex w-full flex-col items-center justify-center gap-5 border border-border/60 bg-background px-6 py-14 text-center shadow-sm",
        className,
      )}
    >
      <div className="relative flex size-20 items-center justify-center rounded-full bg-primary/10">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/10 motion-reduce:animate-none" />
        <SearchX className="relative size-9 text-primary" aria-hidden />
      </div>

      <div className="max-w-lg space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          {code}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actions ?? (
          <>
            <Button asChild>
              <Link href="/">
                <Compass className="size-4" />
                Back to home
              </Link>
            </Button>
            {showBrowseAction ? (
              <Button asChild variant="outline">
                <Link href="/dashboard/browse">Browse collection</Link>
              </Button>
            ) : null}
          </>
        )}
      </div>
    </Card>
  );
}
