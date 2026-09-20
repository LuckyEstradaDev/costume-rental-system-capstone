"use client";

import {Package, Shirt} from "lucide-react";

export type CartTab = "outfits" | "packages";

type CartTabsProps = {
  activeTab: CartTab;
  outfitCount: number;
  packageCount: number;
  onTabChange: (tab: CartTab) => void;
};

/**
 * Segmented tab bar for the cart: separates single outfits from packages.
 * Mirrors the checkout-mode selector language (rounded-full track, filled
 * primary option). Switching tabs is handled by the parent, which resets both
 * selection states so a package and a single outfit can never be selected
 * together.
 */
export function CartTabs({
  activeTab,
  outfitCount,
  packageCount,
  onTabChange,
}: CartTabsProps) {
  const optionClass = (isActive: boolean) =>
    `flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`;

  const countClass = (isActive: boolean) =>
    `text-[11px] ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`;

  return (
    <div
      role="tablist"
      aria-label="Cart contents"
      className="flex w-fit gap-1 rounded-full border border-border bg-muted/30 p-1"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "outfits"}
        onClick={() => onTabChange("outfits")}
        className={optionClass(activeTab === "outfits")}
      >
        <Shirt
          className={`size-4 ${activeTab === "outfits" ? "text-primary-foreground" : ""}`}
        />
        Outfits
        {outfitCount > 0 ? (
          <span className={countClass(activeTab === "outfits")}>
            {outfitCount}
          </span>
        ) : null}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "packages"}
        onClick={() => onTabChange("packages")}
        className={optionClass(activeTab === "packages")}
      >
        <Package
          className={`size-4 ${activeTab === "packages" ? "text-primary-foreground" : ""}`}
        />
        Packages
        {packageCount > 0 ? (
          <span className={countClass(activeTab === "packages")}>
            {packageCount}
          </span>
        ) : null}
      </button>
    </div>
  );
}