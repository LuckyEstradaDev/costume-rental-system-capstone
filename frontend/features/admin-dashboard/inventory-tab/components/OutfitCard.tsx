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
import {CardDropdownMenu} from "./CardDropdownMenu";

export default function OutfitCard({data}: {data: IOutfit}) {
  const totalStock =
    data.variants?.reduce(
      (sum, v) => sum + v.sizes.reduce((s, sz) => s + sz.stock, 0),
      0,
    ) ?? 0;

  return (
    <Card className="group relative py-0 overflow-hidden border-0 shadow-sm ring-1 ring-border/60 transition-all duration-200 hover:shadow-md hover:ring-border">
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
              variant={totalStock === 0 ? "destructive" : "default"}
              className="gap-1 text-[11px] shadow-sm"
            >
              <PackageCheck className="size-3" />
              {totalStock === 0 ? "Out of stock" : `${totalStock} in stock`}
            </Badge>
          </div>
        </div>

        {/* ── Content ── */}
        <CardContent className="flex flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
          {/* Top: name + category */}
          <div className="space-y-2 pr-10">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base leading-snug">
                {data.name}
              </CardTitle>
              <Badge
                variant="default"
                className="rounded-full text-xs font-medium"
              >
                {data.category}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2 text-sm leading-relaxed">
              {data.description}
            </CardDescription>
          </div>

          {/* Bottom: prices + variants */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            {/* Prices */}
            <div className="flex flex-col gap-1">
              {data.price && (
                <div className="flex items-baseline gap-1.5">
                  <span className="w-9 text-[10px] uppercase tracking-wide text-muted-foreground/60">
                    Buy
                  </span>
                  <PhilippinePeso className="size-3 self-center text-muted-foreground" />
                  <span className="text-lg font-medium tabular-nums text-foreground">
                    {data.price.toLocaleString()}
                  </span>
                </div>
              )}

              {data.price && data.rentalPrice && (
                <div className="h-px w-full bg-border/40" />
              )}

              {data.rentalPrice && (
                <div className="flex items-baseline gap-1.5">
                  <span className="w-9 text-[10px] uppercase tracking-wide text-muted-foreground/60">
                    Rent
                  </span>
                  <PhilippinePeso className="size-3 self-center text-muted-foreground/60" />
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {data.rentalPrice.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Variant swatches with tooltips */}
            {data.variants && data.variants.length > 0 && (
              <div className="flex flex-col gap-1.5 items-end">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60">
                  Colors
                </span>
                <TooltipProvider delayDuration={100}>
                  <div className="flex gap-2 items-center">
                    {data.variants.map((variant, index) => {
                      const maxStock = Math.max(
                        ...variant.sizes.map((s) => s.stock),
                        1,
                      );
                      return (
                        <Tooltip key={index}>
                          <TooltipTrigger asChild>
                            <span
                              className="size-[18px] rounded-full cursor-default transition-transform hover:scale-125"
                              style={{
                                backgroundColor: variant.color,
                                boxShadow:
                                  "0 0 0 1.5px hsl(var(--border)), inset 0 0 0 1px rgba(0,0,0,0.08)",
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="p-0 min-w-[130px] bg-white border border-border rounded-md shadow-lg"
                            sideOffset={8}
                          >
                            <div className="p-2.5">
                              {/* Color header */}
                              <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-border/40">
                                <span
                                  className="size-2.5 rounded-full shrink-0"
                                  style={{
                                    backgroundColor: variant.color,
                                    boxShadow:
                                      "0 0 0 1px hsl(var(--border)), inset 0 0 0 1px rgba(0,0,0,0.08)",
                                  }}
                                />
                                <span className="text-[11px] text-muted-foreground capitalize">
                                  {variant.color}
                                </span>
                              </div>
                              {/* Size + stock rows */}
                              <div className="flex flex-col gap-1">
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
