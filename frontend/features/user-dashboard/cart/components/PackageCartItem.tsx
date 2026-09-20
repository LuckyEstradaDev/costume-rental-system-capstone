"use client";

import Image from "next/image";
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
import type {IPackageSnapshot} from "@/features/user-dashboard/package/types/IPackageSnapshot";

const FALLBACK_IMAGE = "/assets/images/landing-page/suit.jpg";

type PackageCartItemProps = {
  pkg: IPackageSnapshot;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

/**
 * Package row for the merged cart list. Mirrors the single-outfit row
 * (CartItem) — same layout, typography, price-chip style, checkbox and
 * remove-button behavior — so both card types look identical in the list.
 *
 * The package items are listed INSIDE the card: a chevron dropdown expands
 * the per-item lines within the card body.
 *
 * NOTE: Deliberately PURE UI — no `.map` / `.filter` / `.find` and no API
 * calls. Package line items are rendered with explicit index access against
 * the current sample snapshot (max 2 items).
 *
 * TODO(wiring): when the real fetch is plugged in, replace the two explicit
 * `pkg.items[0]` / `pkg.items[1]` blocks below with `pkg.items.map(...)`.
 */
export function PackageCartItem({
  pkg,
  checked,
  onCheckedChange,
}: PackageCartItemProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const imageSrc = pkg.imageURL?.[0] || FALLBACK_IMAGE;
  const modeLabel =
    pkg.mode === "rental"
      ? "Rent"
      : pkg.mode === "purchase"
        ? "Buy"
        : "Rent & Buy";
  const itemCount = pkg.items.length;
  const pieceCount =
    (pkg.items[0]?.quantity ?? 0) + (pkg.items[1]?.quantity ?? 0);
  const canRent = pkg.mode !== "purchase";
  const canBuy = pkg.mode !== "rental";

  return (
    <div
      className={`group flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 ${checked ? "border-primary/30 bg-primary/5 ring-1 ring-primary/25" : "border-border/60 bg-transparent hover:bg-muted/40"}`}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mr-2 size-[18px] shrink-0"
      />
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/50">
        <Image
          src={imageSrc}
          alt={pkg.name || "Package"}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-1.5 top-1.5 rounded-md bg-gradient-to-br from-emerald-600 to-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur">
          Package
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold">{pkg.name || "Package"}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Costume package · {modeLabel}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {itemCount} outfit{itemCount === 1 ? "" : "s"} · {pieceCount} piece
          {pieceCount === 1 ? "" : "s"}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {canRent && Number(pkg.rentalTotal ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-500/20">
              <CalendarClock className="size-3.5" />
              ₱{Number(pkg.rentalTotal ?? 0)}
            </span>
          )}
          {canBuy && Number(pkg.purchaseTotal ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-500/20">
              <CreditCard className="size-3.5" />
              ₱{Number(pkg.purchaseTotal ?? 0)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setDetailsOpen((open) => !open)}
          aria-expanded={detailsOpen}
          className="mt-2 inline-flex cursor-pointer items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {detailsOpen ? (
            <ChevronUp className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )}
          {detailsOpen ? "Hide package details" : "View package details"}
        </button>

        {/* Package items — rendered INSIDE the card body, in the same
            text-xs muted style as the outfit's size/color lines. */}
        {detailsOpen && (
          <div className="mt-2 space-y-1.5 rounded-xl bg-muted/40 p-2.5">
            {/* TODO(wiring): replace with pkg.items.map(...) */}
            {pkg.items[0] ? (
              <p className="text-xs text-muted-foreground">
                Size {pkg.items[0].size} × {pkg.items[0].quantity} —{" "}
                {(pkg.mode === "purchase" || pkg.mode === "both") &&
                  `Buy ₱${pkg.items[0].purchasePrice * pkg.items[0].quantity}`}
                {pkg.mode === "both" && " · "}
                {(pkg.mode === "rental" || pkg.mode === "both") &&
                  `Rent ₱${pkg.items[0].rentalPrice * pkg.items[0].quantity}`}
              </p>
            ) : null}
            {pkg.items[1] ? (
              <p className="text-xs text-muted-foreground">
                Size {pkg.items[1].size} × {pkg.items[1].quantity} —{" "}
                {(pkg.mode === "purchase" || pkg.mode === "both") &&
                  `Buy ₱${pkg.items[1].purchasePrice * pkg.items[1].quantity}`}
                {pkg.mode === "both" && " · "}
                {(pkg.mode === "rental" || pkg.mode === "both") &&
                  `Rent ₱${pkg.items[1].rentalPrice * pkg.items[1].quantity}`}
              </p>
            ) : null}
            {!pkg.items[0] && !pkg.items[1] ? (
              <p className="text-xs text-muted-foreground">
                No items configured for this package.
              </p>
            ) : null}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* TODO(wiring): hook this up to removeFromPackageCartService */}
        <Button
          variant="ghost"
          size="sm"
          className="ml-1 size-9 rounded-lg p-0 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}