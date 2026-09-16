"use client";

import {ArrowLeft, Info} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";
import {usePackage} from "../hooks/usePackage";

export function ColorPickerStep() {
  const {
    activeOutfit,
    selectColor,
    goBack,
    getOutfitRemaining,
    getOutfitCurrentQty,
    getMinQuantity,
  } = usePackage();

  if (!activeOutfit) return null;

  const remaining = getOutfitRemaining(activeOutfit._id!);
  const current = getOutfitCurrentQty(activeOutfit._id!);
  const min = getMinQuantity(activeOutfit._id!);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={goBack}
          className="mt-0.5 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border bg-background transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight">
              Select a Color
            </h3>
            <Badge variant="secondary" className="text-xs">
              {activeOutfit.name}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {remaining > 0 ? (
              <>
                Still need <span className="font-medium text-foreground">{remaining}</span> more
                unit{remaining === 1 ? "" : "s"} for this outfit.
                {current > 0 && (
                  <span className="ml-1 text-muted-foreground">
                    ({current}/{min} added so far)
                  </span>
                )}
              </>
            ) : (
              "This outfit's minimum is met."
            )}
          </p>
        </div>
      </div>

      {activeOutfit.variants.length === 0 ? (
        <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          No color variants available for this outfit.
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {activeOutfit.variants.map((variant) => {
            const color = variant.color || "Unnamed";
            const hasStock = variant.sizes.some((s) => s.stock > 0);
            return (
              <button
                key={variant._id ?? color}
                type="button"
                onClick={() => hasStock && selectColor(color)}
                disabled={!hasStock}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all",
                  hasStock
                    ? "cursor-pointer border-border/60 bg-background hover:border-primary/50 hover:shadow-sm"
                    : "cursor-not-allowed border-border/30 bg-muted/50 opacity-50",
                )}
              >
                <div
                  className="size-8 rounded-full border-2 border-white shadow-sm"
                  style={{backgroundColor: color}}
                />
                <div className="text-left">
                  <p className="text-sm font-medium">{color}</p>
                  <p className="text-xs text-muted-foreground">
                    {variant.sizes.reduce((s, sz) => s + sz.stock, 0)} in stock
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-start gap-2 rounded-lg border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        <p>
          You&apos;re configuring <span className="font-medium text-foreground">{activeOutfit.name}</span>.
          After picking a color, you&apos;ll choose a size and quantity. You can repeat
          for other colors until the minimum is met.
        </p>
      </div>
    </div>
  );
}
