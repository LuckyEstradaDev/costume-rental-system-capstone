"use client";

import {ArrowLeft, Minus, Plus, Package} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {usePackage} from "../hooks/usePackage";

export function AmountPickerStep() {
  const {
    activeOutfit,
    selectedColor,
    selectedVariant,
    selectedSize,
    selectedAmount,
    setSelectedAmount,
    commitSelection,
    goBack,
    getMaxAmount,
    getOutfitRemaining,
  } = usePackage();

  if (!activeOutfit || !selectedVariant || !selectedSize) return null;

  const maxAmount = getMaxAmount();
  const remaining = getOutfitRemaining(activeOutfit._id!);
  const sizeData = selectedVariant.sizes.find((s) => s.size === selectedSize);
  const stock = sizeData?.stock ?? 0;

  const canAdd = selectedAmount > 0 && selectedAmount <= maxAmount;

  const handleDecrement = () => {
    setSelectedAmount(Math.max(1, selectedAmount - 1));
  };

  const handleIncrement = () => {
    setSelectedAmount(Math.min(maxAmount, selectedAmount + 1));
  };

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
              Set Quantity
            </h3>
            <Badge variant="secondary" className="text-xs">
              {activeOutfit.name}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="gap-1 text-xs">
              <div
                className="size-3 rounded-full border"
                style={{backgroundColor: selectedColor}}
              />
              {selectedColor}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Size {selectedSize}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border bg-muted/20 p-5">
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-lg bg-background p-3">
            <p className="text-xs text-muted-foreground">In Stock</p>
            <p className="mt-0.5 text-lg font-semibold">{stock}</p>
          </div>
          <div className="rounded-lg bg-background p-3">
            <p className="text-xs text-muted-foreground">Still Need</p>
            <p className="mt-0.5 text-lg font-semibold">{remaining}</p>
          </div>
          <div className="rounded-lg bg-background p-3">
            <p className="text-xs text-muted-foreground">Max Allowed</p>
            <p className="mt-0.5 text-lg font-semibold">{maxAmount}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={selectedAmount <= 1}
            className="flex size-10 cursor-pointer items-center justify-center rounded-lg border bg-background transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Minus className="size-4" />
          </button>
          <div className="min-w-[5rem] text-center">
            <span className="text-3xl font-bold tabular-nums">
              {selectedAmount}
            </span>
            <p className="text-xs text-muted-foreground">
              unit{selectedAmount === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={selectedAmount >= maxAmount}
            className="flex size-10 cursor-pointer items-center justify-center rounded-lg border bg-background transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <Button
        type="button"
        onClick={commitSelection}
        disabled={!canAdd}
        className="w-full cursor-pointer gap-2"
        size="lg"
      >
        <Package className="size-4" />
        Add to Package ({selectedAmount} unit{selectedAmount === 1 ? "" : "s"})
      </Button>
    </div>
  );
}
