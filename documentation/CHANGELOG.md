# Changelog

Records of notable changes to the Costume Rental System. Each entry includes
the date and time the change was applied.

---

## 2026-09-20 15:07 — Package rows merged into the single outfit cart list

**Scope:** Cart page (`/dashboard/cart`) — package only. All existing single
outfit logic (fetching, price loading, checkbox selection, quantity steppers,
removal, checkout summary) was left untouched.

### What changed

- **Merged single cart list.** Single outfit line items and package snapshots
  now render together in **one list** (no separate package section), ordered
  by `createdAt` (newest first) so the cart reads as a single timeline.
- **New `CartEntry` type**
  (`frontend/features/user-dashboard/cart/types/CartEntry.ts`) — unified
  `{kind: "outfit" | "package"}` shape for the merged list.
- **New `PackageCartItem` component**
  (`frontend/features/user-dashboard/cart/components/PackageCartItem.tsx`) —
  a package row stylistically identical to the single-outfit row (`CartItem`):
  - Same layout anatomy: checkbox, 96px thumbnail, `flex-1` details, and a
    trailing action area — same padding, spacing, typography and price-chip
    style (`CalendarClock` / `CreditCard` icon + `₱{...}`).
  - **Checkbox for active / inactive state** — selecting the checkbox
    highlights the row (`bg-primary/10` + ring), exactly like the single
    outfit rows.
  - **Details dropdown** — a `View/Hide package details` chevron toggle
    expands the per-item lines **inside the card body** (same `text-xs`
    muted style as the outfit's size/color lines; no detached panel).
  - Thumbnail with a "Package" badge, package name, mode text
    (Rent / Buy / Rent & Buy), and an outfit/piece count line.
  - Prices use the peso sign (`₱`).
  - Pure UI — rendered with explicit index access (no `.map` / `.filter` /
    `.find`) and **sample data only** (`SAMPLE_PACKAGES` in the cart page).
- **`CartItem` price display update** — now shows **both** the rental and the
  purchase price when an outfit has both (rental chip with `CalendarClock`,
  purchase chip with `CreditCard`), and prices now use the peso sign (`₱`)
  instead of `PHP`. The "Rental unavailable" hint still appears when the
  checkout mode is rent but no rental price exists.
- **`CartList` update** — now accepts `CartEntry[]`; outfit rows keep their
  own running index so their selection keys are unchanged even with packages
  merged in. Package rows are wired to `packageKeys` via `onTogglePackage`.
- **Cart page** — builds the merged list (`cartEntries`) with hardcoded
  `SAMPLE_PACKAGES` (already sorted by date) plus the fetched outfit items.
  Package checkbox state lives in `selectedPackageKeys` (same toggle pattern
  as outfits). The existing `CartEmpty` covers the whole merged list when
  both outfits and packages are empty.
- **`IPackageSnapshot` type** — added `createdAt?: string | Date` to mirror
  the backend package snapshot schema (already stores timestamps) so package
  entries participate in date ordering.

### Not wired yet (intentional — package UI requested only)

- Real fetch of package cart data — page still uses hardcoded
  `SAMPLE_PACKAGES` with a `TODO(fetch)` marker.
- Replacing the explicit per-item rendering in `PackageCartItem` with
  `pkg.items.map(...)` once real fetching is in place (`TODO(wiring)` marker).
- Package remove button (`removeFromPackageCartService`) is decorative only.
- Package checkout integration (e.g., feeding `selectedPackageKeys` into a
  package summary) is out of scope for this UI change.

---

## 2026-09-20 15:23 — Modern UI pass on the cart page

**Scope:** Presentational refresh of the whole cart page
(`/dashboard/cart`) — cart list, selection state, empty state, summary card
and page header. No logic or data-flow changes.

### What changed

- **`CartItem` (single outfits)** — modernization without touching behavior:
  - Rows now have a subtle **hover state** (`hover:bg-muted/40`) and a softer
    **selected state** (`bg-primary/5` + `ring-1 ring-primary/25`) instead of
    the flat `bg-primary/10`.
  - Thumbnail is `rounded-xl` with a hairline ring and a gentle
    `group-hover:scale-105` image zoom; details column gets `min-w-0` +
    `truncate` so long names ellipsize safely.
  - **Price chips became pills**: rent chip is sky
    (`bg-sky-500/10 text-sky-700 ring-sky-500/20`), purchase chip is violet
    (`bg-violet-500/10 text-violet-700 ring-violet-500/20`), each with a
    colored icon — modern and visually distinct.
  - **Quantity stepper** upgraded to a compact bordered control
    (`rounded-xl border p-1`, `size-7` square buttons, centered `w-7` count).
  - Remove button is now a tidy `size-9` icon button with
    `text-destructive/70` resting state and `hover:bg-destructive/10`.
- **`PackageCartItem`** — mirrors every refresh applied to `CartItem`
  (same hover/selected states, rounded thumbnail w/ ring + zoom, sky/violet
  price pills, `size-9` remove button). The "Package" badge now uses an
  emerald **gradient** with a soft shadow, the "View/Hide package details"
  toggle became a small pill-style chip, and the expanded in-card item lines
  sit in a soft `bg-muted/40` inset container — still **inside** the card.
- **`CartList`** — the list container is now a `rounded-2xl` floating card
  (`py-0 gap-0 shadow-sm`) with a header strip ("Cart items" + a
  `rounded-full` count badge); rows live in a clean `divide-y divide-border/60`.
  Selection-index tracking was rewritten to a pure helper
  (`outfitIndexFor`) to satisfy the `react-hooks/immutability` lint rule —
  outfit selection keys are unchanged.
- **`CartEmpty`** — modern empty state: gradient icon tile, dashed `rounded-2xl`
  card, taller padding, and a `Browse Costumes` CTA with arrow icon.
- **`CartSummary`** — `rounded-2xl` + `shadow-sm` container and refined
  selected-item rows (`rounded-xl`, hover tint). Removed a pre-existing unused
  import (`fetchOrderByIdService`).
- **Cart page header** — gradient icon tile (`size-12`), updated subtitle
  ("Review and manage your outfits and packages before checkout"), and a live
  item-count pill in the top-right corner.

### Notes

- All package code keeps its `TODO(wiring)` / `TODO(fetch)` markers — sample
  data only, no API calls, no array iteration functions in the package rows.
- Verified: `tsc --noEmit` and ESLint pass clean on all touched files.

---

## 2026-09-20 15:24 — Improved spacing between cart items

**Scope:** Cart list row layout on `/dashboard/cart` — visual only.

### What changed

- **`CartList`** — the rows container switched from `divide-y divide-border/60`
  (hairline separators, rows flush against each other) to
  `space-y-3 p-4` (visible 12px gaps, inset from the card edges).
- **`CartItem` / `PackageCartItem`** — each row is now its own bordered card:
  `border border-border/60` at rest, `border-primary/30` when selected
  (alongside the existing `bg-primary/5` + ring), so the separated cards
  read as distinct, floating list items instead of a continuous strip.

### Notes

- Verified: `tsc --noEmit` and ESLint pass clean on the three touched files.