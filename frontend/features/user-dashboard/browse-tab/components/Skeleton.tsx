"use client";

import {Portal} from "radix-ui";
import {Card} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

export function BrowseGridSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading browse items"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      {Array.from({length: 10}, (_, index) => (
        <Card
          key={index}
          className="h-full overflow-hidden border border-border/60 bg-background py-0"
        >
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function BrowseOutfitSkeleton() {
  return (
    <div role="status" aria-label="Loading outfit details" className="space-y-8 pb-28">
      <div aria-hidden="true" className="space-y-8 md:space-y-12">
        <Skeleton className="h-6 w-32" />

        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-12">
          <div className="flex h-[calc(100svh-13.5rem)] min-h-72 justify-center xl:shrink-0 xl:justify-start">
            <Skeleton className="aspect-[3/4] h-full max-w-full rounded-2xl" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col xl:min-w-[22rem]">
            <div className="space-y-3">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-8 w-4/5 md:h-9" />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-7">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-16" />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({length: 2}, (_, index) => (
                <div key={index} className="space-y-2 rounded-lg bg-secondary p-5">
                  <Skeleton className="h-5 w-16 max-w-full bg-secondary-foreground/20" />
                  <Skeleton className="h-8 w-28 max-w-full bg-secondary-foreground/20" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[7.5rem_1fr] items-center gap-4 pt-7">
              <Skeleton className="h-5 w-24" />
              <div className="flex flex-wrap gap-2">
                {Array.from({length: 3}, (_, index) => (
                  <Skeleton key={index} className="size-12 rounded-full" />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-[7.5rem_1fr] items-start gap-4 pt-7">
              <Skeleton className="mt-2 h-5 w-24" />
              <div className="flex flex-wrap gap-2">
                {Array.from({length: 3}, (_, index) => (
                  <Skeleton key={index} className="h-14 w-16 rounded-lg" />
                ))}
              </div>
            </div>

            <div className="space-y-1 pt-7">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 md:gap-12">
          <div className="space-y-4">
            <Skeleton className="h-9 w-56 max-w-full" />
            <Skeleton className="h-5 w-full max-w-3xl" />
            <Skeleton className="h-5 w-2/3 max-w-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-9 w-56 max-w-full" />
            {Array.from({length: 3}, (_, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-28" />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-4 w-2/3" />
            {Array.from({length: 3}, (_, index) => (
              <Skeleton key={index} className="h-11 w-full rounded-lg" />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-9 w-56 max-w-full" />
          {Array.from({length: 2}, (_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>

        <Portal.Root asChild>
          <div aria-hidden="true" className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-background pb-[env(safe-area-inset-bottom)]">
            <div className="mx-auto flex w-full max-w-7xl gap-2 px-4 py-3 sm:justify-end md:px-8">
              <Skeleton className="h-9 flex-1 sm:w-32 sm:flex-none" />
              <Skeleton className="h-9 flex-1 sm:w-36 sm:flex-none" />
            </div>
          </div>
        </Portal.Root>
      </div>
    </div>
  );
}
