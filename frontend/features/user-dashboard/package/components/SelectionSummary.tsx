"use client";

import {CalendarClock, CreditCard, Package, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {getColorValue} from "@/features/admin-dashboard/inventory-tab/constants/constants";
import {usePackage} from "../hooks/usePackage";
import {formatPackagePrice} from "../utils/formatters";

function formatMoney(value: number) {
  return formatPackagePrice(value);
}

function ReceiptLine({
  kind,
  unitPrice,
  quantity,
}: {
  kind: "purchase" | "rent";
  unitPrice: number;
  quantity: number;
}) {
  const Icon = kind === "purchase" ? CreditCard : CalendarClock;

  return (
    <div className="flex items-center gap-2 text-[14px]">
      <Icon
        className="size-3.5 shrink-0 text-muted-foreground"
        aria-label={kind === "purchase" ? "Purchase price" : "Rent price"}
      />
      <span className="shrink-0 tabular-nums text-muted-foreground">
        {quantity} × {formatMoney(unitPrice)}
      </span>
      <span
        aria-hidden
        className="flex-1 border-t border-dotted border-border/70"
      />
      <span className="shrink-0 font-medium tabular-nums text-foreground">
        {formatMoney(unitPrice * quantity)}
      </span>
    </div>
  );
}

export function SelectionSummary() {
  const {
    selections,
    removeSelection,
    getMinQuantity,
    getOutfitCurrentQty,
    isOutfitComplete,
    packageItem,
  } = usePackage();

  const showPurchase =
    packageItem.mode === "purchase" || packageItem.mode === "both";
  const showRental =
    packageItem.mode === "rental" || packageItem.mode === "both";

  if (selections.length === 0) return null;

  const groupedByOutfit = selections.reduce<
    Record<string, typeof selections>
  >((acc, sel) => {
    if (!acc[sel.outfitId]) acc[sel.outfitId] = [];
    acc[sel.outfitId].push(sel);
    return acc;
  }, {});

  const totals = selections.reduce(
    (acc, sel) => ({
      purchase: acc.purchase + sel.purchasePrice * sel.quantity,
      rental: acc.rental + sel.rentalPrice * sel.quantity,
    }),
    {purchase: 0, rental: 0},
  );

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Package className="size-4 text-primary" />
        <h3 className="text-base font-semibold">Your selections</h3>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[14px] font-medium text-primary">
          {selections.length} item{selections.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border bg-background">
        {Object.entries(groupedByOutfit).map(([outfitId, sels], groupIndex) => {
          const complete = isOutfitComplete(outfitId);
          const current = getOutfitCurrentQty(outfitId);
          const min = getMinQuantity(outfitId);

          return (
            <div
              key={outfitId}
              className={groupIndex > 0 ? "border-t border-border" : undefined}
            >
              <div className="flex items-center justify-between gap-2 px-4 py-3">
                <p className="text-base font-semibold">{sels[0].outfitName}</p>
                {complete ? (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[14px] font-medium text-green-700">
                    Complete
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[14px] font-medium text-amber-700">
                    {current}/{min}
                  </span>
                )}
              </div>

              <div className="divide-y divide-border/60 border-t border-border/60">
                {sels.map((sel) => {
                  const absoluteIndex = selections.indexOf(sel);
                  return (
                    <div
                      key={`${outfitId}-${sel.variantId}-${sel.size}-${absoluteIndex}`}
                      className="space-y-1.5 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="size-3.5 shrink-0 rounded-full border"
                            style={{backgroundColor: getColorValue(sel.color)}}
                            title={sel.color}
                            aria-label={`Color ${sel.color}`}
                          />
                          <span className="truncate text-base text-muted-foreground">
                            {sel.size || "One Size"}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6 shrink-0 cursor-pointer text-muted-foreground/70 hover:text-destructive"
                          onClick={() => removeSelection(absoluteIndex)}
                          aria-label={`Remove ${sel.outfitName} ${sel.color} size ${sel.size}`}
                        >
                          <X className="size-3.5 text-primary" />
                        </Button>
                      </div>

                      <div className="space-y-1 pl-[1.375rem]">
                        {showPurchase && (
                          <ReceiptLine
                            kind="purchase"
                            unitPrice={sel.purchasePrice}
                            quantity={sel.quantity}
                          />
                        )}
                        {showRental && (
                          <ReceiptLine
                            kind="rent"
                            unitPrice={sel.rentalPrice}
                            quantity={sel.quantity}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="space-y-1.5 border-t border-dashed border-border px-4 py-3.5">
          {showPurchase && (
            <div className="flex items-center gap-2 text-base">
              <CreditCard
                className="size-4 shrink-0 text-primary"
                aria-label="Purchase total"
              />
              <span className="font-medium text-muted-foreground">
                Total
              </span>
              <span
                aria-hidden
                className="flex-1 border-t border-dotted border-border"
              />
              <span className="font-semibold tabular-nums">
                {formatMoney(totals.purchase)}
              </span>
            </div>
          )}
          {showRental && (
            <div className="flex items-center gap-2 text-base">
              <CalendarClock
                className="size-4 shrink-0 text-primary"
                aria-label="Rent total"
              />
              <span className="font-medium text-muted-foreground">
                Total
              </span>
              <span
                aria-hidden
                className="flex-1 border-t border-dotted border-border"
              />
              <span className="font-semibold tabular-nums">
                {formatMoney(totals.rental)}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
