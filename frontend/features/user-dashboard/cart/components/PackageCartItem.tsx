"use client";

import Image from "next/image";
import Link from "next/link";
import {useState} from "react";
import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Trash2,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {buildOutfitSlug, buildPackageSlug} from "@/lib/slug";
import type {
  IPackageCartItem,
  PackageMode,
} from "@/features/user-dashboard/package/types/IPackageCartItem";
import type {Snapshot} from "../types/ISnapshot";

const FALLBACK_IMAGE = "/assets/images/landing-page/suit.jpg";

type PackageCartItemProps = {
  pkg: IPackageCartItem;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

type PackageItemRowProps = {
  item: Snapshot;
  mode: PackageMode;
  /**
   * When set, only that price line is rendered — the checkout summary passes
   * the active checkout mode so it shows rent *or* purchase, never both.
   * When omitted (the cart card), both valid prices render.
   */
  priceMode?: "rent" | "purchase";
};

/**
 * One outfit inside a package. The snapshot stores the outfit's display data
 * (name, category, image, color) alongside size/quantity/prices at add-to-cart
 * time, so the row renders directly without extra fetching.
 *
 * The thumbnail and name link back to the outfit's detail page.
 */
function PackageItemRow({item, mode}: PackageItemRowProps) {
  const name = item.name;
  const imageSrc = item.imageURL || FALLBACK_IMAGE;
  const category = item.category;
  const href = `/dashboard/browse/${buildOutfitSlug(name, item.outfitId)}`;

  const rentalPrice = Number(item.rentalPrice) || 0;
  const showRent = mode !== "purchase" && rentalPrice > 0;
  const showBuy = mode !== "rental" && item.price > 0;

  return (
    <div className="flex items-center gap-2.5">
      <Link
        href={href}
        title={`View ${name}`}
        className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/50"
      >
        <Image src={imageSrc} alt={name} fill className="object-cover" />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={href}
          className="block truncate text-xs font-semibold transition-colors hover:text-primary hover:underline"
        >
          {name}
        </Link>
        <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
          {category ? `${category} · ` : ""}Size {item.size} · Qty{" "}
          {item.quantity}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-0.5 text-[11px] font-semibold">
        {showRent ? (
          <span className="inline-flex items-center gap-1 text-primary">
            <CalendarClock className="size-3" />₱{rentalPrice * item.quantity}
          </span>
        ) : null}
        {showBuy ? (
          <span className="inline-flex items-center gap-1 text-primary">
            <CreditCard className="size-3" />₱{item.price * item.quantity}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Package row for the merged cart list. Mirrors the single-outfit row
 * (CartItem) — same layout, typography, price style, checkbox and
 * remove-button behavior — so both card types look identical in the list.
 *
 * The package items are listed INSIDE the card: a chevron dropdown expands a
 * compact per-outfit row for each item (thumbnail, name, size/qty, prices, and
 * a link back to that outfit's detail page).
 */
export function PackageCartItem({
  pkg,
  checked,
  onCheckedChange,
}: PackageCartItemProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const imageSrc = pkg.imageURL?.[0] || FALLBACK_IMAGE;
  const packageHref = `/dashboard/browse/package/${buildPackageSlug(
    pkg.name || "Package",
    pkg.packageId,
  )}`;
  const pieceCount = pkg.items.reduce((sum, item) => sum + item.quantity, 0);
  const canRent = pkg.mode !== "purchase";
  const canBuy = pkg.mode !== "rental";

  return (
    <div
      className={`group flex items-center gap-4 rounded-lg border p-4 transition-colors ${checked ? "border-primary bg-primary/5" : "border-border bg-background hover:border-border/80 hover:bg-muted/40"}`}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mr-2 size-[18px] shrink-0"
      />
      <Link
        href={packageHref}
        title={`View ${pkg.name || "package"}`}
        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/50"
      >
        <Image
          src={imageSrc}
          alt={pkg.name || "Package"}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
          Package
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold">
          <Link
            href={packageHref}
            className="transition-colors hover:text-primary hover:underline"
          >
            {pkg.name || "Package"}
          </Link>
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {pieceCount} piece{pieceCount === 1 ? "" : "s"}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
          {canRent && Number(pkg.rentalTotal ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1.5 text-primary">
              <CalendarClock className="size-3.5" />₱
              {Number(pkg.rentalTotal ?? 0)}
            </span>
          )}
          {canBuy && Number(pkg.purchaseTotal ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1.5 text-primary">
              <CreditCard className="size-3.5" />₱
              {Number(pkg.purchaseTotal ?? 0)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setDetailsOpen((open) => !open)}
          aria-expanded={detailsOpen}
          className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {detailsOpen ? (
            <ChevronUp className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )}
          {detailsOpen ? "Hide package details" : "View package details"}
        </button>

        {/* Package items — compact rows inside the card body, each linking
            back to its outfit detail page. */}
        {detailsOpen && (
          <div className="mt-3 space-y-2.5">
            {pkg.items.length > 0 ? (
              pkg.items.map((item) => (
                <PackageItemRow
                  key={`${item.outfitId}-${item.variantId}-${item.size}`}
                  item={item}
                  mode={pkg.mode}
                />
              ))
            ) : (
              <p className="text-xs text-muted-foreground">
                No items configured for this package.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* TODO(wiring): hook this up to removeFromPackageCartService */}
        <Button
          variant="ghost"
          size="sm"
          className="ml-1 size-8 rounded-md p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
