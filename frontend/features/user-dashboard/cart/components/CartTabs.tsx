"use client";

import {Package, Shirt} from "lucide-react";

import {
  SEGMENTED_BUTTON_CLASS,
  SEGMENTED_COUNT_CLASS,
  SEGMENTED_ICON_CLASS,
  SEGMENTED_TRACK_CLASS,
} from "@/components/ui/segmented";
import {
  SlidingThumb,
  useSlidingThumb,
} from "@/components/ui/use-sliding-thumb";
import {cn} from "@/lib/utils";

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
  const {trackRef, thumb} = useSlidingThumb(activeTab);

  const optionClass = (isActive: boolean) =>
    cn(
      "relative z-10",
      SEGMENTED_BUTTON_CLASS,
      isActive
        ? // The fill slides behind the options, so the active one only carries
          // the text colour. Until the fill has been measured the option
          // paints its own background.
          thumb
          ? "text-primary-foreground"
          : "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground",
    );

  const countClass = (isActive: boolean) =>
    cn(
      SEGMENTED_COUNT_CLASS,
      isActive ? "text-primary-foreground/80" : "text-muted-foreground",
    );

  return (
    <div
      ref={trackRef}
      role="tablist"
      aria-label="Cart contents"
      className={cn(SEGMENTED_TRACK_CLASS, "w-fit")}
    >
      {thumb ? <SlidingThumb thumb={thumb} /> : null}
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "outfits"}
        onClick={() => onTabChange("outfits")}
        data-segmented-active={activeTab === "outfits" ? "true" : undefined}
        className={optionClass(activeTab === "outfits")}
      >
        <Shirt
          className={cn(
            SEGMENTED_ICON_CLASS,
            activeTab === "outfits" && "text-primary-foreground",
          )}
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
        data-segmented-active={activeTab === "packages" ? "true" : undefined}
        className={optionClass(activeTab === "packages")}
      >
        <Package
          className={cn(
            SEGMENTED_ICON_CLASS,
            activeTab === "packages" && "text-primary-foreground",
          )}
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
