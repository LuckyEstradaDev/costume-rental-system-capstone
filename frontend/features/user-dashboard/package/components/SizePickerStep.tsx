"use client";

import {ArrowLeft, Ruler, AlertTriangle} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setLoading(true);
    // on first render, deduct the selections to the outfits

    setTimeout(() => {
      setLoading(false);
    }, 300);
  }, [selections]);

  const sizes = useMemo(() => {
    if (!activeOutfit || !selectedVariant) return [];
    return selectedVariant.sizes.map((sizeOption) => {
      const taken = selections
        .filter(
          (sel) =>
            sel.outfitId === activeOutfit._id && sel.size === sizeOption.size,
        )
        .reduce((sum, sel) => sum + sel.quantity, 0);
      return {...sizeOption, stock: Math.max(0, sizeOption.stock - taken)};
    });
  }, [activeOutfit, selectedVariant, selections]);

  if (!activeOutfit || !selectedVariant) return null;

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
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight">
              Select a Size
            </h3>
            <Badge variant="secondary" className="text-xs">
              {activeOutfit.name}
            </Badge>
            <Badge variant="outline" className="gap-1 text-xs">
              <div
                className="size-3 rounded-full border"
                style={{backgroundColor: selectedColor}}
              />
              {selectedColor}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Choose a size for this color variant.
          </p>
        </div>
      </div>

      {sizes.length === 0 ? (
        <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
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
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <Ruler className="size-3.5 text-muted-foreground" />
                    {size}
                  </span>
                  <span
                    className={cn(
                      "text-xs",
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

      <div className="flex items-start gap-2 rounded-lg border bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
        <p>
          Sizes with <span className="font-medium">0 in stock</span> are
          unavailable and cannot be selected.
        </p>
      </div>
    </div>
  );
}
