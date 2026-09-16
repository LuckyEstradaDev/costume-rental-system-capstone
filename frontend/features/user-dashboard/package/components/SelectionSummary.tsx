"use client";

import {X, Package} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {usePackage} from "../hooks/usePackage";

export function SelectionSummary() {
  const {selections, removeSelection, getMinQuantity, getOutfitCurrentQty, isOutfitComplete} =
    usePackage();

  if (selections.length === 0) return null;

  const groupedByOutfit = selections.reduce<
    Record<string, typeof selections>
  >((acc, sel) => {
    if (!acc[sel.outfitId]) acc[sel.outfitId] = [];
    acc[sel.outfitId].push(sel);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Package className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Your Selections</h3>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {selections.length}
        </span>
      </div>

      <div className="space-y-3">
        {Object.entries(groupedByOutfit).map(([outfitId, sels]) => {
          const complete = isOutfitComplete(outfitId);
          const current = getOutfitCurrentQty(outfitId);
          const min = getMinQuantity(outfitId);

          return (
            <div
              key={outfitId}
              className="rounded-xl border bg-background"
            >
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{sels[0].outfitName}</p>
                  {complete ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Complete
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {current}/{min}
                    </span>
                  )}
                </div>
              </div>

              <Separator />

              <div className="divide-y">
                {sels.map((sel) => {
                  const absoluteIndex = selections.indexOf(sel);
                  return (
                    <div
                      key={`${outfitId}-${sel.variantId}-${sel.size}-${absoluteIndex}`}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="size-4 rounded-full border"
                          style={{backgroundColor: sel.color}}
                        />
                        <span className="text-muted-foreground">
                          {sel.color}, size {sel.size}
                        </span>
                        <span className="font-medium">× {sel.quantity}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0 cursor-pointer text-muted-foreground hover:text-destructive"
                        onClick={() => removeSelection(absoluteIndex)}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
