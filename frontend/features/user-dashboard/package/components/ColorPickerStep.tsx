"use client";

import {ArrowLeft, Info} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {getColorValue} from "@/features/admin-dashboard/inventory-tab/constants/constants";
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
                Still need{" "}
                <span className="font-medium text-foreground">{remaining}</span>{" "}
                more unit{remaining === 1 ? "" : "s"} for this outfit.
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
                title={color}
                aria-label={color}
                className={cn(
                  "flex size-14 items-center justify-center rounded-full border-2 transition-all",
                  hasStock
                    ? "cursor-pointer border-border/60 bg-background hover:border-primary/50 hover:shadow-sm"
                    : "cursor-not-allowed border-border/30 bg-muted/50 opacity-50",
                )}
              >
                <span
                  className="size-9 rounded-full border border-foreground/20"
                  style={{
                    backgroundColor: getColorValue(color),
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
