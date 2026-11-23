"use client";

import type React from "react";
import {AnimatePresence, motion} from "framer-motion";
import {CartItem} from "./CartItem";
import {PackageCartItem} from "./PackageCartItem";
import {getCartItemKey} from "../utils";
import {staggerContainer, staggerItem} from "@/components/motion";
import type {CheckoutMode} from "../types/checkout";
import type {Snapshot} from "../types/ISnapshot";
import type {CartEntry} from "../types/CartEntry";

type CartListProps = {
  entries: CartEntry[];
  emptyLabel?: string;
  selectedKeys: string[];
  packageKeys: string[];
  checkoutMode: CheckoutMode;
  onQuantityChange: (outfitId: string, change: number) => void;
  onToggleItem: (item: Snapshot, index: number, checked: boolean) => void;
  onTogglePackage: (packageId: string, checked: boolean) => void;
};

export function CartList({
  entries,
  emptyLabel = "No items in cart",
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

  if (!entries || entries.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <motion.div
      layout
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      <AnimatePresence mode="popLayout">
        {entries.map((entry, index) => {
          if (entry.kind === "package") {
            const packageKey = entry.pkg.packageId || `pkg-${index}`;
            return (
              <motion.div
                layout
                key={packageKey}
                variants={staggerItem}
                exit="exit"
              >
                <PackageCartItem
                  pkg={entry.pkg}
                  checked={packageKeys.includes(packageKey)}
                  onCheckedChange={(checked) =>
                    onTogglePackage(packageKey, checked)
                  }
                />
              </motion.div>
            );
          }

          const item = entry.item;
          const itemIndex = outfitIndexFor(index);
          const itemKey = getCartItemKey(item, itemIndex);

          return (
            <motion.div
              layout
              key={itemKey}
              variants={staggerItem}
              exit="exit"
            >
              <CartItem
                onQuantityChange={onQuantityChange}
                item={item}
                checked={selectedKeys.includes(itemKey)}
                checkoutMode={checkoutMode}
                onCheckedChange={(checked) =>
                  onToggleItem(item, itemIndex, checked)
                }
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}