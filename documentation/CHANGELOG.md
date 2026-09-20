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

---

## 2026-09-20 15:27 — Redesign: summary card & checkout mode selector

**Scope:** The remaining cart UI elements — `CartSummary` and
`CheckoutModeSelector` on `/dashboard/cart`. All checkout logic
(subtotal/total math, stock validation, mode switching, routing) untouched.

### What changed

- **`CheckoutModeSelector`** — replaced the two plain buttons with a modern
  **segmented control**: a `rounded-full bg-muted/70 p-1` track, active pill
  pops with `bg-background + shadow-sm + ring`, and the icons tint to match
  the price pills used in the rows (Rent = sky, Buy = violet). Added a small
  "Checkout mode" label and proper `radiogroup`/`radio` semantics.
- **`CartSummary`** — full redesign matching the list card:
  - Header strip with a gradient `ReceiptText` icon tile, "Order Summary"
    title and a selected-count subtitle (mirrors the `CartList` header).
  - "Selected items" section: uppercase label with a `ListChecks` icon and a
    pill count badge; each row now shows a `Qty` chip and a cleaner
    `category · Size · Color` meta line.
  - Empty selection state upgraded to a centered, dashed placeholder with
    icon.
  - **Totals panel** — Subtotal / Total sit in a soft `bg-muted/40` box; the
    Total row carries a mode-colored icon (sky clock for rent, violet bag for
    buy) consistent with everything else on the page.
  - Primary CTA keeps `size="lg"` with a soft shadow; "Continue Shopping"
    is now a ghost button so the main action stands out.

### Notes

- Verified: `tsc --noEmit` and ESLint pass clean on both files.

---

## 2026-09-20 15:33 — Modern UI pass on the checkout screen

**Scope:** Checkout flow (`/dashboard/cart/checkout`) and its form/summary
components. All checkout logic (price resolution, stock validation, order
placement, payment-type switching) untouched.

### What changed

- **Checkout page** — header now matches the cart page (gradient
  `CreditCard` icon tile, `text-2xl` title, "Back to cart" outline button);
  the empty state is a dashed `rounded-2xl` card with a gradient icon tile;
  the "Transaction details" form is a header-strip `rounded-2xl` card exactly
  like `CartList`/`CartSummary` (gradient ico tile + "Rental / Purchase
  checkout" subtitle, content padded inside).
- **`CheckoutSummary`** — fully restyled to mirror the new **Order Summary**:
  header strip with a mode-colored icon (`CalendarClock` sky for rent,
  `ShoppingBag` violet for buy), count badge on the section label, item rows
  with `Qty` chips and `category · Size · Color` meta, a **Payment** row with
  a tinted icon (emerald `HandCoins` cash / sky `Smartphone` online), and a
  soft totals panel with a mode-colored Total icon.
- **`PaymentTypeSelector`** — replaced the two plain buttons with selectable
  **radio cards**: tinted icon tiles (emerald cash, sky online), a short
  description line under each label, and the online option keeps its disabled
  state (dimmed, `cursor-not-allowed`).
- **`CheckoutNotesField`** — added an "Optional" hint next to the label and a
  clearer placeholder.
- **`RentCheckoutFields`** — the helper text is now a bordered callout with a
  sky `Info` icon instead of a bare paragraph.
- **`RentCheckoutForm`** — removed the now-redundant top `Separator` (the card
  header covers that spacing) and turned "Rental Instructions" into a
  bordered callout with an `Info` icon.

### Notes

- `BuyCheckoutForm` needed no structure change — it inherits the new card
  container and padded content area.
- Verified: `tsc --noEmit` and ESLint pass clean on all touched files.

---

## 2026-09-20 15:40 — Redesign: minimal flat (removed the "generic AI" look)

**Scope:** Cart + checkout screens. Per user direction: drop the template-y
treatment (repeated gradient icon tiles, gray header strips, identical pills,
uniform shadows/rounding) in favour of a **minimal flat** style — thin
borders, flat surfaces, no gradients or shadows, and distinct identity per
element. All logic untouched.

### What changed

- **Page headers (cart + checkout)** — gradient icon tiles removed; the icon
  now sits inline with the title as plain flat text. The item count pill is
  gone (the count now reads inline in the subtitle). Each header ends with a
  single hairline `border-b` rule.
- **`CartList`** — the enclosing `rounded-2xl` shadow card and its gray header
  strip are gone entirely. The list is now a plain vertical stack of flat,
  individually bordered item cards (`rounded-lg border`, `space-y-3`).
- **`CartItem` / `PackageCartItem`** — `rounded-xl`/pills/rings replaced with:
  flat `rounded-lg` bordered cards (selected = `border-primary bg-primary/5`,
  hover = light tint, no ring, no shadow); prices are now plain colored text
  with icons (no pill background/ring); stepper is `rounded-md border`
  without shadow; trash is a flat `size-8` ghost. The "Package" badge is a
  flat emerald-tinted label (no gradient), the details toggle is a plain text
  chevron button, and the expanded item lines are indented under a thin left
  rule instead of a gray box.
- **`CartSummary` / `CheckoutSummary`** — no more gradient header tiles or
  gray panels. Both are flat bordered cards with a simple baseline header
  (`Title` left, mode count/icon right) separated by a hairline; item lists
  use a **receipt-style** `divide-dashed` list; totals sit under a plain
  `border-t` rule (no `bg-muted/40` box); the Payment row is a plain line
  (icon + label + value).
- **`CheckoutModeSelector`** — flat `bg-muted/30` track with `border`, active
  option just flips to `bg-background`; shadow/ring removed.
- **`PaymentTypeSelector`** — flat radio cards (no icon tiles); icons are
  plain tinted glyphs beside the label.
- **`CartEmpty` / checkout empty state** — dashed `rounded-lg` cards with a
  plain muted icon (no gradient tile).
- **`RentCheckoutFields` / rent instructions** — gray `bg-muted/30` callouts
  downgraded to flat `border` notes.

### Notes

- Verification: `tsc --noEmit` + ESLint pass clean on all touched files.
- The checkout mode colour markers (sky = rent, violet = buy) are retained as
  text colour only — no chips or tiles.

---

## 2026-09-20 15:44 — Colour & badge tweaks

**Scope:** Cart + checkout accents, per user feedback. Visual only.

### What changed

- **Package badge is now filled** — solid `bg-primary text-primary-foreground`
  square-ish label over the thumbnail (no more outline tint).
- **Checkout mode selector is a pill** — segmented control and its options are
  `rounded-full`, active option stays `bg-background`.
- **All accents use the primary colour only** — every `sky-*` (blue),
  `violet-*`, and `emerald-*` (green) class was replaced with `text-primary`:
  row prices (`CartItem`, `PackageCartItem`), summary/checkout total icons,
  checkout mode icons, payment-type icons, and the rental `Info` callout
  icons.

### Notes

- Confirmed zero remaining `sky-*` / `violet-*` / `emerald-*` classes in the
  checkout/cart feature components.
- Verified: `tsc --noEmit` + ESLint pass clean on all touched files.

---

## 2026-09-20 15:45 — Checkout mode fill + removed thin horizontal lines

**Scope:** Cart + checkout UI, per user feedback. Visual only.

### What changed

- **Checkout mode selector gets a fill** — the active option is now solid
  `bg-primary text-primary-foreground` (icon included), so the selected
  Rent/Buy pill is clearly filled with the primary colour.
- **Thin horizontal lines removed** across the cart & checkout UI:
  - Page headers (`cart/page.tsx`, `checkout/page.tsx`) no longer have a
    `border-b` rule under the title.
  - Transaction details card header — `border-b` removed.
  - `CartSummary` / `CheckoutSummary` — header `border-b` removed; item list
    switched from `divide-dashed` hairlines to plain stacked items
    (`space-y-3`, no dividers); totals section `border-t` removed.
- Card outline borders, dashed empty-state boxes, and the package details
  left rule are intentionally kept — they are box/outline shapes, not
  horizontal separator lines.

### Notes

- Verified: `tsc --noEmit` + ESLint pass clean on all touched files; no
  `border-b` / `border-t` / `divide-*` horizontal rules remain in the
  cart/checkout scope.