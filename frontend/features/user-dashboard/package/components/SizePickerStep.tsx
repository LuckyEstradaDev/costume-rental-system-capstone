"use client";

import {Ruler as EmptyIcon} from "lucide-react";
import {EmptyState} from "@/components/ui/empty-state";
import {ArrowLeft, PersonStanding, Ruler} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";
import {compareSizes, formatSizeLabel, getSizeIconClass} from "@/lib/size";
import {cn} from "@/lib/utils";
import {usePackage} from "../hooks/usePackage";
import {useEffect, useMemo, useState} from "react";
import {PackageSizeChart} from "./PackageSizeChart";

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
            <h3 className="flex items-center gap-2 text-lg font-semibold text-primary">
              <Ruler className="size-4 text-primary" />
              Select a size
            </h3>
          </div>
        </div>
      </div>

      {sizes.length === 0 ? (
        <EmptyState icon={EmptyIcon} title="No sizes available for this color" className="min-h-0 py-6" />
      ) : (
        <div className="flex flex-wrap gap-3">
          {loading ? (
            <>
              {Array.from({length: sizes.length}).map((_, i) => (
                <Skeleton
                  key={i}
                  aria-hidden
                  className="size-14 rounded-xl"
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
                    "group flex size-14 flex-col items-center justify-center gap-0.5 rounded-xl border-[3px] border-secondary transition-colors",
                    isAvailable
                      ? "cursor-pointer bg-background hover:bg-secondary hover:text-white"
                      : "cursor-not-allowed bg-muted/50 opacity-50",
                  )}
                >
                  <span className="flex items-center gap-0.5 text-xs font-semibold">
                    <PersonStanding
                      className={cn("text-primary", isAvailable && "group-hover:text-white", getSizeIconClass(size))}
                    />
                    {sizeLabel}
                  </span>
                  <span
                    className={cn(
                      "text-center text-[10px] leading-tight",
                      isAvailable
                        ? "text-muted-foreground group-hover:text-white"
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
      <PackageSizeChart sizes={sizes} />
    </div>
  );
}
