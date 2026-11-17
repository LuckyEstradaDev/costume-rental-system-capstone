"use client";

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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        {/* ── Section 1: image + product information ── */}
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] xl:gap-12">
          <section className="min-w-0">
            <Skeleton className="h-[calc(100svh-13.5rem)] min-h-[18rem] w-full rounded-2xl" />
          </section>

          <section className="flex flex-col rounded-2xl bg-background p-5 shadow-sm sm:p-6">
            {/* Title + stats eyebrow */}
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            {/* Price panels */}
            <div className="pt-7">
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({length: 2}).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-5">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-9 w-28" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Color selectors */}
            <div className="space-y-3 pt-7">
              <Skeleton className="h-4 w-16" />
              <div className="flex flex-wrap gap-2">
                {Array.from({length: 4}).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-20 rounded-full" />
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ── Description card ── */}
        <section className="mt-8 rounded-2xl bg-background p-5 shadow-sm sm:p-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </section>

        {/* ── Product Specification card ── */}
        <section className="mt-8 space-y-4 rounded-2xl bg-background p-5 shadow-sm sm:p-6">
          <Skeleton className="h-8 w-56" />
          {Array.from({length: 3}).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </section>

        {/* ── Size chart card ── */}
        <section className="mt-8 space-y-4 rounded-2xl bg-background p-5 shadow-sm sm:p-6">
          <Skeleton className="h-8 w-40" />
          <div className="space-y-2">
            {Array.from({length: 4}).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </section>

        {/* ── Reviews card ── */}
        <section className="mt-8 rounded-2xl bg-background p-5 shadow-sm sm:p-6">
          <Skeleton className="h-8 w-56" />

          <div className="mt-6 grid gap-5 border-b border-border pb-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-10">
            <div className="space-y-2">
              <Skeleton className="h-12 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-2">
              {Array.from({length: 5}).map((_, i) => (
                <Skeleton key={i} className="h-2 w-full rounded-full" />
              ))}
            </div>
          </div>

          <div className="divide-y divide-border">
            {Array.from({length: 3}).map((_, i) => (
              <div key={i} className="space-y-3 py-5 first:pt-6 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Skeleton className="size-10 shrink-0 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
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
        </section>
      </div>
    </div>
  );
}
