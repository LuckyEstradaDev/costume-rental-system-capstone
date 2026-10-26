"use client";

import {ArrowLeft, Minus, Plus, Package, Ruler, Hash, AlertTriangle} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {getColorValue} from "@/features/admin-dashboard/inventory-tab/constants/constants";
import {MEASUREMENT_LABELS} from "@/lib/measurements";
import {usePackage} from "../hooks/usePackage";
import {useEffect} from "react";
import {formatPackageMeasurement} from "../utils/formatters";

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
    selections,
  } = usePackage();

  if (!activeOutfit || !selectedVariant || !selectedSize) return null;

  const maxAmount = getMaxAmount();
  const remaining = getOutfitRemaining(activeOutfit._id!);
  const sizeData = selectedVariant.sizes.find((s) => s.size === selectedSize);
  const stock = sizeData?.stock ?? 0;

  const measurements = Object.entries(sizeData?.measurements ?? {}).filter(
    ([, value]) => value != null && value > 0,
  ) as [string, number][];

  const canAdd = selectedAmount > 0 && selectedAmount <= maxAmount;

  const handleDecrement = () => {
    setSelectedAmount(Math.max(1, selectedAmount - 1));
  };

  const handleIncrement = () => {
    setSelectedAmount(Math.min(maxAmount, selectedAmount + 1));
  };

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
          <h3 className="flex items-center gap-2 text-[20px] font-semibold tracking-tight text-foreground">
            <Hash className="size-4 text-primary" />
            Set Quantity
          </h3>
        </div>
      </div>

      {measurements.length > 0 && (
        <section className="space-y-3 rounded-xl">
          <p className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
            <Ruler className="size-4 text-primary" />
            Measurements
          </p>
          <div className="flex flex-wrap gap-3">
            {measurements.map(([key, value]) => (
              <div
                key={key}
                className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-base"
              >
                <Ruler className="size-3.5 text-primary" />
                <span className="text-muted-foreground">
                  {MEASUREMENT_LABELS[key] ?? key}
                </span>
                <span className="font-medium text-foreground">
                  {formatPackageMeasurement(value)} in
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center text-base">
          <div className="space-y-1">
            <p className="flex items-center justify-center gap-1 text-[14px] font-semibold text-foreground">
              <Package className="size-3.5 text-primary" />
              In stock
            </p>
            <p className="text-muted-foreground">{stock}</p>
          </div>
          <div className="space-y-1">
            <p className="flex items-center justify-center gap-1 text-[14px] font-semibold text-foreground">
              <AlertTriangle className="size-3.5 text-primary" />
              Still need
            </p>
            <p className="text-muted-foreground">{remaining}</p>
          </div>
          <div className="space-y-1">
            <p className="flex items-center justify-center gap-1 text-[14px] font-semibold text-foreground">
              <Hash className="size-3.5 text-primary" />
              Max allowed
            </p>
            <p className="text-muted-foreground">{maxAmount}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={selectedAmount <= 1}
            className="flex size-10 cursor-pointer items-center justify-center rounded-lg border bg-background transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Minus className="size-4 text-primary" />
          </button>
          <div className="min-w-[5rem] text-center">
            <span className="text-[32px] font-bold tabular-nums">
              {selectedAmount}
            </span>
            <p className="text-[14px] text-muted-foreground">
              unit{selectedAmount === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={selectedAmount >= maxAmount}
            className="flex size-10 cursor-pointer items-center justify-center rounded-lg border bg-background transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="size-4 text-primary" />
          </button>
        </div>
      </div>
      
      <div className="w-full flex items-center justify-center">
        <Button
          type="button"
          onClick={commitSelection}
          disabled={!canAdd}
          className="cursor-pointer gap-2 text-base"
          size="lg"
          >
          <Package className="size-4 text-white" />
          Add to Package
        </Button>
        </div>
    </div>
  );
}
