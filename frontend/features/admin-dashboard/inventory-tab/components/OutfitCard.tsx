import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {PackageCheck, PhilippinePeso} from "lucide-react";
import {IOutfit} from "../types/IOutfit";
import {getColorValue} from "../constants/constants";
import {CardDropdownMenu} from "./CardDropdownMenu";

export default function OutfitCard({data}: {data: IOutfit}) {
  const totalStock =
    data.variants?.reduce(
      (sum, v) => sum + v.sizes.reduce((s, sz) => s + sz.stock, 0),
      0,
    ) ?? 0;
  const isLowStock = totalStock > 0 && totalStock <= 5;
  const stockLabel =
    totalStock === 0
      ? "Out of stock"
      : isLowStock
        ? `Low stock · ${totalStock}`
        : `${totalStock} in stock`;
  const stockBadgeClass =
    totalStock === 0
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : isLowStock
        ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200"
        : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200";

  return (
    <Card className="group relative min-w-0 overflow-hidden border-0 py-0 shadow-sm ring-1 ring-border/60 transition-all duration-200 hover:shadow-md hover:ring-border">
      <CardDropdownMenu outfit={data} />

      <div className="flex flex-col sm:flex-row">
        {/* ── Image ── */}
        <div className="relative shrink-0 overflow-hidden h-48 sm:h-auto sm:w-44 sm:self-stretch">
          <Image
            src={
              data.imageURL?.toString() ||
              "/assets/images/landing-page/suit.jpg"
            }
            sizes="(max-width: 640px) 100vw, 176px"
            alt={data.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute bottom-2 left-2">
            <Badge
              variant="outline"
              className={`gap-1 rounded-md text-[11px] shadow-sm ${stockBadgeClass}`}
            >
              <PackageCheck className="size-3" />
              {stockLabel}
            </Badge>
          </div>
        </div>

        {/* ── Content ── */}
        <CardContent className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
          {/* Top: name + category */}
          <div className="min-w-0 space-y-2 pr-10">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="min-w-0 max-w-full break-words text-base leading-snug">
                {data.name}
              </CardTitle>
              <Badge
                variant="default"
                className="max-w-full truncate rounded-full text-xs font-medium"
              >
                {data.category}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2 break-words text-sm leading-relaxed">
              {data.description}
            </CardDescription>
          </div>

          {/* Bottom: prices + variants */}
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            {/* Prices */}
            <div className="flex flex-col gap-1">
              {data.price && (
                <div className="flex min-w-0 items-baseline gap-1.5">
                  <span className="w-9 text-[10px] uppercase tracking-wide text-muted-foreground/60">
                    Buy
                  </span>
                  <PhilippinePeso className="size-3 self-center text-muted-foreground" />
                  <span className="min-w-0 break-words text-lg font-medium tabular-nums text-foreground">
                    {data.price.toLocaleString()}
                  </span>
                </div>
              )}

              {data.price && data.rentalPrice && (
                <div className="h-px w-full bg-border/40" />
              )}

              {data.rentalPrice && (
                <div className="flex min-w-0 items-baseline gap-1.5">
                  <span className="w-9 text-[10px] uppercase tracking-wide text-muted-foreground/60">
                    Rent
                  </span>
                  <PhilippinePeso className="size-3 self-center text-muted-foreground/60" />
                  <span className="min-w-0 break-words text-sm tabular-nums text-muted-foreground">
                    {data.rentalPrice.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Variant swatches with tooltips */}
            {data.variants && data.variants.length > 0 && (
              <div className="flex max-w-full flex-col items-end gap-1.5">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60">
                  Colors
                </span>
                <TooltipProvider delayDuration={100}>
                  <div className="flex max-w-full flex-wrap items-center gap-2">
                    {data.variants.map((variant, index) => {
                      const maxStock = Math.max(
                        ...variant.sizes.map((s) => s.stock),
                        1,
                      );
                      const colorValue = getColorValue(variant.color);
                      return (
                        <Tooltip key={index}>
                          <TooltipTrigger asChild>
                            <span
                              className="size-[18px] shrink-0 cursor-default rounded-full border border-foreground/40 transition-transform hover:scale-125"
                              style={{
                                backgroundColor: colorValue,
                                boxShadow:
                                  "inset 0 0 0 1px rgba(0,0,0,0.12)",
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="min-w-[130px] rounded-md border border-border bg-popover p-0 text-popover-foreground shadow-lg"
                            sideOffset={8}
                          >
                            <div className="p-2.5">
                              {/* Color header */}
                              <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-border/40">
                                <span
                                  className="size-2.5 shrink-0 rounded-full border border-foreground/40"
                                  style={{
                                    backgroundColor: colorValue,
                                    boxShadow:
                                      "inset 0 0 0 1px rgba(0,0,0,0.12)",
                                  }}
                                />
                                <span className="text-[11px] text-muted-foreground capitalize">
                                  {variant.color}
                                </span>
                              </div>
                              {/* Size + stock rows */}
                              <div className="flex min-w-0 flex-col gap-1">
                                {variant.sizes.map((s) => (
                                  <div
                                    key={s.size}
                                    className="flex items-center gap-2.5"
                                  >
                                    <span
                                      className={`text-xs font-medium w-6 ${
                                        s.stock === 0
                                          ? "text-muted-foreground/40 line-through"
                                          : "text-foreground"
                                      }`}
                                    >
                                      {s.size}
                                    </span>
                                    <div className="h-[3px] w-8 rounded-full bg-border/40 overflow-hidden">
                                      <div
                                        className="h-full rounded-full bg-foreground/30"

                                        style={{
                                          width: `${(s.stock / maxStock) * 100}%`,
                                        }}
                                      />
                                    </div>
                                    <span
                                      className={`text-[11px] tabular-nums min-w-[1.25rem] text-right ${
                                        s.stock === 0
                                          ? "text-muted-foreground/30"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      {s.stock}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </TooltipProvider>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
