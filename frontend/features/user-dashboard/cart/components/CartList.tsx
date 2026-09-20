"use client";

import type React from "react";
import {Card} from "@/components/ui/card";
import {CartItem} from "./CartItem";
import {PackageCartItem} from "./PackageCartItem";
import {getCartItemKey} from "../utils";
import type {CheckoutMode} from "../types/checkout";
import type {Snapshot} from "../types/ISnapshot";
import type {CartEntry} from "../types/CartEntry";

type CartListProps = {
  entries: CartEntry[];
  selectedKeys: string[];
  packageKeys: string[];
  checkoutMode: CheckoutMode;
  onQuantityChange: (outfitId: string, change: number) => void;
  onToggleItem: (item: Snapshot, index: number, checked: boolean) => void;
  onTogglePackage: (packageId: string, checked: boolean) => void;
};

export function CartList({
  entries,
  selectedKeys,
  packageKeys,
  checkoutMode,
  onQuantityChange,
  onToggleItem,
  onTogglePackage,
}: CartListProps) {
  // Outfit rows keep their own running index so their selection keys are
  // identical to the standalone outfit list even when packages are merged in.
  const outfitIndexFor = (entryIndex: number) =>
    entries
      .slice(0, entryIndex)
      .filter((entry) => entry.kind === "outfit").length;

  return (
    <Card className="gap-0 overflow-hidden rounded-2xl py-0 shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-5 py-3.5">
        <span className="text-sm font-semibold text-foreground">
          Cart items
        </span>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {entries.length} {entries.length === 1 ? "item" : "items"}
        </span>
      </div>
      {entries && entries.length > 0 ? (
        <div className="space-y-3 p-4">
          {entries.map((entry, index) => {
            if (entry.kind === "package") {
              const packageKey = entry.pkg.packageId || `pkg-${index}`;
              return (
                <PackageCartItem
                  key={packageKey}
                  pkg={entry.pkg}
                  checked={packageKeys.includes(packageKey)}
                  onCheckedChange={(checked) =>
                    onTogglePackage(packageKey, checked)
                  }
                />
              );
            }

            const item = entry.item;
            const itemIndex = outfitIndexFor(index);
            const itemKey = getCartItemKey(item, itemIndex);

            return (
              <CartItem
                onQuantityChange={onQuantityChange}
                key={itemKey}
                item={item}
                checked={selectedKeys.includes(itemKey)}
                checkoutMode={checkoutMode}
                onCheckedChange={(checked) =>
                  onToggleItem(item, itemIndex, checked)
                }
              />
            );
          })}
        </div>
      ) : (
        <div className="px-5 py-12 text-center text-sm text-muted-foreground">
          No items in cart
        </div>
      )}
    </Card>
  );
}