"use client";

import {Skeleton} from "@/components/ui/skeleton";
import {Card} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";

export function BrowseOutfitSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] xl:gap-12">
          {/* ── Left: Image + Meta ── */}
          <section className="space-y-5">
            <Skeleton className="aspect-4/3 w-full rounded-2xl sm:aspect-16/11" />

            <div className="grid gap-4 border-t pt-5 sm:grid-cols-3">
              {Array.from({length: 3}).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </section>

          {/* ── Right: Details ── */}
          <section className="flex flex-col gap-8">
            {/* Badges + Title */}
            <div className="space-y-5">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            {/* Price cards */}
            <div className="grid gap-4 border-y py-6 sm:grid-cols-2">
              {Array.from({length: 2}).map((_, i) => (
                <div key={i} className="rounded-xl border p-5 space-y-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              ))}
            </div>

            {/* Color + Size selectors */}
            <div className="space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-16" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({length: 4}).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-20 rounded-full" />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Skeleton className="h-4 w-12" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({length: 5}).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-14 rounded-md" />
                  ))}
                </div>
              </div>
            </div>

            {/* Selection status */}
            <div className="grid gap-4 border-t pt-6 sm:grid-cols-2">
              {Array.from({length: 2}).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-4 w-36" />
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4">
              <Skeleton className="h-11 w-full rounded-md md:w-56" />
              <Skeleton className="h-11 w-full rounded-md md:w-56" />
            </div>
          </section>
        </div>

        {/* ── Reviews ── */}
        <section className="mt-8">
          <Card className="w-full border-border/70 bg-muted/20 p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-9 w-32 rounded-full" />
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              {Array.from({length: 3}).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border bg-background p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Skeleton className="size-10 rounded-full shrink-0" />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-4 w-10 rounded-full" />
                        </div>
                        <div className="flex gap-1">
                          {Array.from({length: 5}).map((_, j) => (
                            <Skeleton key={j} className="size-3.5 rounded-sm" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
