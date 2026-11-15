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
import {PackageCheck} from "lucide-react";
import {IOutfit} from "../types/IOutfit";
import {getColorValue} from "../constants/constants";
import {CardDropdownMenu} from "./CardDropdownMenu";

export default function OutfitCard({data}: {data: IOutfit}) {
  const totalStock =
    data.variants?.reduce(
      (sum, v) => sum + (v.sizes ?? []).reduce((s, sz) => s + (sz.stock ?? 0), 0),
      0,
    ) ?? 0;
  const isLowStock = totalStock > 0 && totalStock <= 5;
  const stockLabel =
    totalStock === 0
      ? "Out of stock"
      : isLowStock
        ? `Low stock: ${totalStock}`
        : `${totalStock} in stock`;
  // Solid fills so the badge stays legible over any photo: destructive when
  // out, gold accent when low, secondary (navy) when healthy.
  const stockBadgeClass =
    totalStock === 0
      ? "border-0 bg-destructive text-white"
      : isLowStock
        ? "border-0 bg-accent text-accent-foreground"
        : "border-0 bg-secondary text-secondary-foreground";
  const hasArModel =
    typeof data.modelURL === "string" && Boolean(data.modelURL);

  return (
    <Card className="group relative h-full min-h-52 min-w-0 overflow-hidden rounded-lg border-0 bg-muted py-0 ring-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/15">
      <CardDropdownMenu outfit={data} />

      <div className="flex h-full flex-col sm:flex-row">
        {/* ── Image ── */}
        <div className="relative h-48 shrink-0 overflow-hidden sm:h-auto sm:w-44 sm:self-stretch">
          <Image
            src={
              data.imageURL?.toString() ||
              "/assets/images/landing-page/suit.jpg"
            }
            sizes="(max-width: 640px) 100vw, 176px"
            alt={data.name || "Outfit"}
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
          {/* Top: name + description */}
          <div className="min-w-0 space-y-2 pr-10">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="min-w-0 max-w-full break-words text-lg leading-snug font-semibold text-primary">
                {data.name}
              </CardTitle>
              {hasArModel && (
                <Badge
                  variant="secondary"
                  className="rounded-full text-xs font-medium"
                >
                  With AR
                </Badge>
              )}
            </div>
            <CardDescription className="line-clamp-2 break-words text-sm leading-relaxed">
              {data.description}
            </CardDescription>
          </div>

          {/* Bottom: prices + variants */}
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            {/* Prices: buy is the larger line, rent the quieter one */}
            <div className="flex flex-col gap-1.5">
              {data.price && (
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="w-10 text-sm text-muted-foreground">Buy</span>
                  <span className="min-w-0 break-words text-xl font-semibold tabular-nums text-primary">
                    ₱{data.price.toLocaleString()}
                  </span>
                </div>
              )}

              {data.rentalPrice && (
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="w-10 text-sm text-muted-foreground">Rent</span>
                  <span className="min-w-0 break-words text-base tabular-nums text-foreground/70">
                    ₱{data.rentalPrice.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Variant swatches with tooltips */}
            {data.variants && data.variants.length > 0 && (
              <div className="flex max-w-full flex-col items-end gap-1.5">
                <span className="text-sm text-muted-foreground">Colors</span>
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
                              className="size-5 shrink-0 cursor-default rounded-full border border-foreground/30 transition-transform hover:scale-125"
                              style={{
                                backgroundColor: colorValue,
                                boxShadow:
                                  "inset 0 0 0 1px rgba(0,0,0,0.12)",
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="min-w-[130px] rounded-lg border-0 bg-popover p-0 text-popover-foreground shadow-lg"
                            sideOffset={8}
                          >
                            <div className="space-y-2.5 p-3">
                              {/* Color header */}
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="size-2.5 shrink-0 rounded-full border border-foreground/30"
                                  style={{
                                    backgroundColor: colorValue,
                                    boxShadow:
                                      "inset 0 0 0 1px rgba(0,0,0,0.12)",
                                  }}
                                />
                                <span className="text-xs font-medium text-foreground capitalize">
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
                                      className={`w-6 text-xs font-medium ${
                                        s.stock === 0
                                          ? "text-muted-foreground/40 line-through"
                                          : "text-foreground"
                                      }`}
                                    >
                                      {s.size}
                                    </span>
                                    <div className="h-1 w-8 overflow-hidden rounded-full bg-muted">
                                      <div
                                        className="h-full rounded-full bg-accent"
                                        style={{
                                          width: `${(s.stock / maxStock) * 100}%`,
                                        }}
                                      />
                                    </div>
                                    <span
                                      className={`min-w-[1.25rem] text-right text-[11px] tabular-nums ${
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