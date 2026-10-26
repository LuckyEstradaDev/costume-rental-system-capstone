"use client";

import {ArrowLeft, PersonStanding, Ruler} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {getColorValue} from "@/features/admin-dashboard/inventory-tab/constants/constants";
import {compareSizes, formatSizeLabel, getSizeIconClass} from "@/lib/size";
import {cn} from "@/lib/utils";
import {usePackage} from "../hooks/usePackage";
import {useEffect, useMemo, useState} from "react";

export function SizePickerStep() {
  const {
    activeOutfit,
    selectedColor,
    selectedVariant,
    selections,
    selectSize,
    goBack,
  } = usePackage();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    // on first render, deduct the selections to the outfits

    setTimeout(() => {
      setLoading(false);
    }, 300);
  }, [selections]);

  const sizes = useMemo(() => {
    if (!activeOutfit || !selectedVariant) return [];
    return selectedVariant.sizes
      .map((sizeOption) => {
        const taken = selections
          .filter(
            (sel) =>
              sel.outfitId === activeOutfit._id && sel.size === sizeOption.size,
          )
          .reduce((sum, sel) => sum + sel.quantity, 0);
        return {...sizeOption, stock: Math.max(0, sizeOption.stock - taken)};
      })
      .sort((a, b) => compareSizes(a.size, b.size));
  }, [activeOutfit, selectedVariant, selections]);

  if (!activeOutfit || !selectedVariant) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={goBack}
          className="mt-0.5 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border bg-background transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-4 text-primary" />
        </button>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="flex items-center gap-2 text-[20px] font-semibold tracking-tight text-foreground">
              <Ruler className="size-4 text-primary" />
              Select a Size
            </h3>
          </div>
        </div>
      </div>

      {sizes.length === 0 ? (
        <div className="rounded-xl border border-dashed px-4 py-10 text-center text-base text-muted-foreground">
          No sizes available for this color.
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {loading ? (
            <>
              {Array.from({length: sizes.length}).map((_, i) => (
                <Skeleton
                  key={i}
                  aria-hidden
                  className="h-16 w-24 animate-pulse rounded-xl bg-muted"
                />
              ))}
            </>
          ) : (
            sizes.map((sizeOption) => {
              const size = sizeOption.size || "One Size";
              const sizeLabel = formatSizeLabel(size);
              const isAvailable = sizeOption.stock > 0;
              return (
                <button
                  key={`${selectedVariant._id ?? selectedColor}-${size}`}
                  type="button"
                  onClick={() => isAvailable && selectSize(size)}
                  disabled={!isAvailable}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border-2 px-5 py-3 transition-all",
                    isAvailable
                      ? "cursor-pointer border-border/60 bg-background hover:border-primary/50 hover:shadow-sm"
                      : "cursor-not-allowed border-border/30 bg-muted/50 opacity-50",
                  )}
                >
                  <span className="flex items-center gap-1.5 text-base font-semibold">
                    <PersonStanding
                      className={`text-primary ${getSizeIconClass(size)}`}
                    />
                    {sizeLabel}
                  </span>
                  <span
                    className={cn(
                      "text-[14px]",
                      isAvailable
                        ? "text-muted-foreground"
                        : "text-destructive",
                    )}
                  >
                    {isAvailable
                      ? `${sizeOption.stock} in stock`
                      : "Out of stock"}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
