"use client";

import {ArrowLeft, Ruler, AlertTriangle} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";
import {usePackage} from "../hooks/usePackage";
import {useEffect, useState} from "react";

export function SizePickerStep() {
  const {
    activeOutfit,
    selectedColor,
    selectedVariant,
    selections,
    selectSize,
    goBack,
  } = usePackage();

  if (!activeOutfit || !selectedVariant) return null;
  const [sizes, setSizes] = useState(selectedVariant.sizes);

  useEffect(() => {
    // on first render, deduct the selections to the outfits
    const outfitToDeduct = selections.find(
      (active) => active.outfitId === activeOutfit._id,
    );

    setSizes((prev) => prev.)
  }, [selections]);

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
          {sizes.map((sizeOption) => {
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
                    isAvailable ? "text-muted-foreground" : "text-destructive",
                  )}
                >
                  {isAvailable
                    ? `${sizeOption.stock} in stock`
                    : "Out of stock"}
                </span>
              </button>
            );
          })}
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
