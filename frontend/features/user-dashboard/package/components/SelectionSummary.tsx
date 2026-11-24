"use client";

import {useState} from "react";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {formatCurrency} from "@/lib/formatters";
import {CartRemoveButton} from "../../cart/components/CartRemoveButton";
import {getSafeOrderImageSrc} from "../../orders/utils/image";
import {formatSizeLabel} from "@/lib/size";
import {usePackage} from "../hooks/usePackage";

export function SelectionSummary() {
  const {selections, removeSelection, packageItem, buildPackagePayload} =
    usePackage();
  const [priceMode, setPriceMode] = useState<"rental" | "purchase">("rental");

  if (selections.length === 0) return null;

  const isRent = (packageItem.mode === "both" ? priceMode : packageItem.mode) === "rental";
  const pkg = buildPackagePayload(selections);
  const total = (isRent ? pkg.rentalTotal : pkg.purchaseTotal) ?? 0;

  return (
    <section className="w-full min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-primary md:text-2xl">
          Your selections
        </h2>
        {packageItem.mode === "both" && (
          <div role="group" aria-label="Show package prices" className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={isRent ? "secondary" : "outline"}
              aria-pressed={isRent}
              onClick={() => setPriceMode("rental")}
              className="cursor-pointer"
            >
              Rental
            </Button>
            <Button
              type="button"
              variant={isRent ? "outline" : "secondary"}
              aria-pressed={!isRent}
              onClick={() => setPriceMode("purchase")}
              className="cursor-pointer"
            >
              Purchase
            </Button>
          </div>
        )}
      </div>
      <div className="overflow-x-auto" role="region" aria-label="Selected outfits" tabIndex={0}>
        <table className="w-full whitespace-nowrap text-left">
          <thead className="text-sm text-muted-foreground">
            <tr>
              <th scope="col" className="py-2 pr-4 font-medium">Item</th>
              <th scope="col" className="px-4 py-2 text-right font-medium">Qty × price</th>
              <th scope="col" className="py-2 pl-4 text-right font-medium">Total</th>
              <th scope="col" className="w-12 pl-3"><span className="sr-only">Remove</span></th>
            </tr>
          </thead>
          <tbody>
            {pkg.items.map((item, index) => {
              const unitPrice = isRent ? (item.rentalPrice ?? 0) : item.price;
              const size = item.size ? formatSizeLabel(item.size) : "One Size";

              return (
                <tr key={`${item.outfitId}-${item.variantId}-${item.size}`}>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/50">
                        <Image
                          src={getSafeOrderImageSrc(item.imageURL)}
                          alt={item.name || "Outfit"}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <span className="text-base font-medium text-foreground">{item.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {[size, item.color].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right text-sm tabular-nums text-secondary">
                    {item.quantity} × {formatCurrency(unitPrice)}
                  </td>
                  <td className="py-2 pl-4 text-right text-base font-semibold tabular-nums text-secondary">
                    {formatCurrency(unitPrice * item.quantity)}
                  </td>
                  <td className="py-2 pl-3 text-right">
                    <CartRemoveButton
                      onClick={() => removeSelection(index)}
                      aria-label={`Remove ${item.name}, ${[size, item.color].filter(Boolean).join(", ")}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <dl className="mt-4 space-y-2 border-t border-border/50 pt-4 text-sm text-secondary">
        <div className="flex items-center justify-between gap-4">
          <dt>{isRent ? "Rental total" : "Purchase total"}</dt>
          <dd className="font-semibold tabular-nums">{formatCurrency(total)}</dd>
        </div>
      </dl>
    </section>
  );
}
