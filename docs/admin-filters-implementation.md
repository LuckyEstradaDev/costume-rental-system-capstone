# Admin Dashboard Filters & Payment Payer — Implementation Notes

How the admin date filtering, chart bucketing, and payment-payer display were built.

---

## 1. The core decision: filter in the browser, not the database

The dashboard fetches **every** row it needs up front, then filters and re-buckets
entirely on the client.

```
GET /api/payments   ─┐
GET /api/orders     ─┤
GET /api/rents      ─┼─→  useDashboardFilters  ─→  metrics + series  ─→  charts / stat cards
GET /api/admin/user-count ─┘        │
                                     └─ everything below the query is pure, synchronous derivation
```

**Why:** the project has no server-side aggregation for these endpoints, so
adding query-parameter filtering would have meant rewriting four repository
methods. Client-side filtering is also what makes compare-to-previous-period
deltas possible — the prior window is just the same array filtered against a
different range, with no second round trip.

**Trade-off, stated plainly:** this is fine at capstone scale and will not scale.
The dataset is held in memory and re-bucketed on every filter change. The correct
production move is to push `from`/`to`/`granularity` into the repository
aggregation pipelines and return series directly.

The consequence that shaped everything else: **any derived state must be
`useMemo` over props and queries, never a `useEffect` that copies state.** See
bug #1 and #7 in §9.

---

## 2. File map

### New — date model and window resolution
| File | Responsibility |
|---|---|
| `dashboard/types/filters.ts` | `Granularity`, `WindowPresetId`, `DateRange`, `DashboardControls` |
| `dashboard/utils/dateRange.ts` | Local-time date math, presets, bucket building, granularity fallback, range checks |
| `dashboard/hooks/useDateWindow.ts` | Minimal preset + custom-range state, shared by all four pages |

### New — UI
| File | Responsibility |
|---|---|
| `dashboard/components/slicers/DateRangeDropdown.tsx` | The collapsible popover. Generic; takes an optional `children` slot |
| `dashboard/components/slicers/DateWindowSlicer.tsx` | Preset buttons + custom start/end `<input type="date">` |
| `dashboard/components/slicers/GranularitySlicer.tsx` | Day/Week/Month/Quarter/Year, disabling unusable options |
| `components/ui/popover.tsx` | Radix Popover wrapper (shadcn-style, re-added) |

### New — derivation
| File | Responsibility |
|---|---|
| `dashboard/utils/applyFilters.ts` | Range filtering, dense bucket allocation, net revenue series, count series, user series |
| `dashboard/hooks/useDashboardFilters.tsx` | Single source of truth: queries, window, filtering, series, deltas, current state, mutations |

### Modified
| File | Change |
|---|---|
| `app/(protected)/admin/dashboard/page.tsx` | Rewritten around the merged stat grid + `DateRangeDropdown` |
| `app/(protected)/admin/orders/page.tsx` | Date dropdown; filters before stats **and** list |
| `app/(protected)/admin/payments/page.tsx` | Date dropdown; **Paid by** column; name is searchable |
| `app/(protected)/admin/reviews/page.tsx` | Date dropdown applied *before* grouping; effect-driven load replaced with a memo |
| `components/ui/stat-card.tsx` | Added `hint` and `delta` props + `DeltaBadge` |
| `dashboard/components/*.tsx` (5 charts) | Made prop-driven; removed self-fetching and data duplication |
| `dashboard/services/services.tsx`, `payments-tab/services/paymentService.tsx` | Added date fields and the `user` payer |
| `backend/src/repositories/PaymentRepository.ts` | `getAllPayments()` now resolves the payer |

---

## 3. The date model

### Local time, deliberately

Every date helper builds dates through the local-time constructor:

```ts
export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());
```

Not `date.setUTCHours(0,0,0,0)`, and not `new Date("2026-03-01")` — that string
form parses as **UTC midnight**, which in UTC+8 (Philippines, this project's
deployment) is 08:00 local and would silently shift every boundary by a day.

The same reasoning drives `parseDateInputValue`, which parses `<input type="date">`
output as local midnight by hand rather than through `new Date(string)`.

### Presets and resolution

`WINDOW_PRESETS` is a declarative list. `resolveWindow` turns
`presetId + customFrom + customTo` into one concrete `DateRange`:

```ts
{ id: "30d", label: "Last 30 days", resolve: (now) => ({
    from: addDays(startOfDay(now), -29), to: endOfDay(now) }) },
{ id: "all", label: "All time", resolve: () => null },   // null = derive from data
```

**The `-29` is load-bearing.** "Last 30 days" means 30 calendar days *including
today*, so it spans `today - 29` → `today`. `-30` would produce a 31-day window
and every delta would be quietly wrong.

### "All time" without data bounds

`resolveWindow` takes `dataBounds`, but list pages have no aggregate endpoint to
derive bounds from. Rather than collapse "all time" to *today* — which would hide
every historical row and look like data loss — it returns a sentinel:

```ts
if (!dataBounds.earliest) {
  return {from: new Date(1970, 0, 1), to: new Date(2100, 0, 1)};
}
```

This is why list pages default to **All time** while the dashboard defaults to
**Last 30 days** — narrowing a table on arrival is surprising; narrowing a
chart is expected.

---

## 4. Granularity that can never disagree with itself

A window change can make the selected bucket size unreadable — "All time" at
daily granularity is ~50,000 points. Rather than truncating the series or
letting the control lie, `resolveGranularity` falls back to the coarsest bucket
that fits:

```ts
export const resolveGranularity = (range, preferred) => {
  if (isGranularityUsable(range, preferred)) return preferred;
  for (const g of [...GRANULARITIES].reverse()) {
    if (isGranularityUsable(range, g)) return g;
  }
  return "year";
};
```

Two details make this safe:

- `countBuckets` **early-exits** past `MAX_BUCKETS` (366). Without that, the
  sentinel 1970–2100 range is ~50k iterations on every render of the control.
- `GranularitySlicer` renders the **resolved** value, not the requested one. The
  control and the chart therefore read from the same number and cannot drift.

---

## 5. Revenue: net of refunds

Revenue is attributed to when money moved, not when the row was written:

```ts
export const paymentDate = (payment) => payment.paidAt ?? payment.createdAt;
```

One bucketing pass covers every status that represents revenue movement:

| Status | Effect |
|---|---|
| `paid` | Adds the amount |
| `refunded` | Subtracts the amount |

```ts
const settled = payment.status === "paid";
const refunded = payment.status === "refunded";
if (!settled && !refunded) continue;
...
values[position] += refunded ? -amount : amount;
```

The dashboard reports **net** revenue: collected minus refunded. Because the card
and the chart above it both read the same precomputed figure, they can never
contradict each other.

### No negatives on the line charts

Net revenue is legitimately negative in a bucket where refunds exceed
collections. Two changes keep the axis clean:

```ts
data: series.map((point) => Math.max(0, point.value)),   // clamp
y: {beginAtZero: true, min: 0, grid: {...}}              // pin axis
```

**This clamp is presentation only.** A bucket netting −₱500 draws as 0 on the
line, but the stat card and the chart total still report the true signed figure.
Zero-clamping the data (rather than only the axis) is what stops the `fill: true`
area from rendering below the axis.

---

## 6. Deltas

`previousWindow` derives the immediately preceding window of equal length, and
returns `null` for all-time ranges, which have no meaningful predecessor.

```ts
const previousTo = new Date(startOfDay(range.from).getTime() - 1);
const previousFrom = new Date(previousTo.getTime() - spanMs);
```

`StatCardDelta` distinguishes three states that a naive percentage conflates:

```ts
{current, percent: number | null, previous, hasPrevious: boolean}
```

| Condition | Rendered |
|---|---|
| `!hasPrevious` | "No prior period" |
| `percent === null`, `current > 0` | "New in this period" |
| `percent === null`, `current === 0` | "No change" |
| `Math.round(percent) === 0` | "No change" with a minus |
| otherwise | `+12% vs prev` / `−4% vs prev` |

"Up from zero to 5" is not a +∞% growth story, so it is labelled rather than
formatted as one.

---

## 7. The filter UI

`DateRangeDropdown` is a collapsed `Button` reporting the active selection,
expanding into a Radix Popover of presets plus custom start/end.

```tsx
<DateRangeDropdown
  presetId={dateWindow.presetId}
  range={dateWindow.range}
  customFrom={dateWindow.customFrom}
  customTo={dateWindow.customTo}
  isDefault={dateWindow.isDefault}
  defaultPreset="all"
  onPresetChange={dateWindow.setPreset}
  ...
>
  {/* dashboard only: bucket size */}
  <GranularitySlicer ... />
</DateRangeDropdown>
```

**A popover, not a dialog.** A popover nested inside a modal traps focus; the
panel has to be able to stay open while you adjust it. A modal with an Apply
button is the workaround for a constraint that a popover does not have.

**Edits apply live.** Typing a date sets `presetId: "custom"` in the same state
update, so there is no Apply button and no confirm step, and the panel stays open
so you can keep adjusting.

**The `children` slot** is why one component serves four pages. The dashboard
passes the granularity control; the list pages pass nothing and get a shorter
panel. This replaced the dashboard-only `FilterDropdown` wrapper rather than
duplicating the popover three more times.

### `defaultPreset` exists for the reset label

`Reset to last 30 days` vs `Reset to all time` is derived from the prop:
`Reset to {presetLabel(defaultPreset).toLowerCase()}`. One prop, correct copy on
every page.

---

## 8. Applying the window to the three list pages

Each page filters rows client-side with the same `isWithinRange`, widened to
accept raw API timestamps:

```ts
export const isWithinRange = (value, range) => {
  if (value === null || value === undefined || value === "") return false;
  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();
  return Number.isFinite(time) &&
    time >= range.from.getTime() && time <= range.to.getTime();
};
```

An absent date is **out of range**, so a row with no timestamp drops out of any
bounded window rather than sliding in at some default.

| Page | Field | Placement |
|---|---|---|
| Orders | `order.createdAt` | Before **both** `AdminOrdersStats` and `AdminOrdersList` |
| Payments | `paidAt \|\| createdAt` | Last filter in the chain |
| Reviews | `review.createdAt` | **Before** grouping |

Two placements are deliberate:

- **Orders** filters first so the stat cards and the table always agree. Cards
  computed from unfiltered rows beside a filtered table would be a silent lie.
- **Reviews** filters before grouping so each card's review count and average
  rating describe exactly the reviews listed beneath it. Filtering after grouping
  would leave ratings computed over reviews that are no longer displayed.

Payments' "Collected today" and "Pending payments" cards deliberately **ignore**
the window — the first is explicitly *today*, the second is a current-state
gauge. This matches the dashboard's split between windowed measures and
current-state gauges.

---

## 9. Resolving the payment payer

### The problem

`Payment` has no user field:

```ts
{referenceID, orderID, method, status, totalAmount, cash, change, paidAt}
```

`orderID` points at **either** an `Order` or a `Rent`, and both carry only
`userID` — never a name. (`Review` is the one model with a `userSnapshot`; orders
and rents are not.) So the chain is three hops:

```
Payment ──orderID──→ Order | Rent ──userID──→ User ──→ firstName / lastName
```

### The implementation

`PaymentRepository.getAllPayments()` resolves it in **three batched queries**,
not one per payment:

```ts
const payments = await PaymentModel.find().sort({paidAt: -1}).lean();

const transactionIds = payments
  .map((p) => p.orderID)
  .filter((id): id is Types.ObjectId => Boolean(id));

const [orders, rents] = await Promise.all([
  OrderModel.find({_id: {$in: transactionIds}}).select("userID").lean(),
  RentModel.find({_id: {$in: transactionIds}}).select("userID").lean(),
]);

// An id lives in at most one collection, so a single map covers both.
const userIdByTransaction = new Map<string, Types.ObjectId>();
for (const t of [...orders, ...rents]) {
  userIdByTransaction.set(t._id.toString(), t.userID);
}

const users = await UserModel.find({_id: {$in: [...new Set(userIdByTransaction.values())]}})
  .select("firstName lastName email").lean();
```

The "one map covers both" comment is the non-obvious part: an ObjectId is unique
across the whole database, so an id cannot appear in both collections and the
merge cannot collide.

This mirrors the existing `UserRepository.getAllRentsAndOrders()` pattern —
same `.select("firstName lastName email")`, same `Map` lookup, same
`user` field name, so `orders` and `payments` read consistently.

Three queries total regardless of payment count. The naive version — a
`UserRepository` call per payment — would be 1 + N.

### Frontend

`PaymentItem` gains `user?: PaymentPayer | null`, and the table renders a
**Paid by** column between Reference and Method. `null` renders as an italic
"Unlinked" rather than blank, so a payment with a deleted order is visibly
unresolved rather than looking like an empty name.

The name is composed the same way the profile page and sidebar compose it:

```ts
const payerName = (user) =>
  user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : "";
```

It is also **searchable**, because a column that cannot be searched is a column
nobody can use to find the row they are looking at.

---

## 10. Pre-existing bugs found and fixed

These were all live defects, not stylistic preferences.

1. **Live slicer bug — charts went blank on period change.** The old
   `useDashboardFilters` effect omitted `sortFilter` from its dependency array,
   so switching period left two charts rendering nothing. Eliminated structurally
   by removing all derived-state effects.

2. **Phantom seed data.** `helpers.ts` injected `2023`–`2026` into every series,
   so charts always showed a long flat phantom tail. Removed with the rewrite to
   real bucketing.

3. **Dead placeholder text.** `StatCard` accepted a `detail` prop it never
   rendered, so every subtitle on the old dashboard was invisible. Replaced with
   `hint`/`delta`, which are actually rendered.

4. **Double-fetching charts.** `RentalBarChart` re-queried `/api/rents` and
   `/api/orders` internally while the page already held that data. All five
   charts are now prop-driven; the page is the only fetcher.

5. **Unbounded bar labels.** The "most rented" chart rendered every outfit. Now
   Top 8 plus a rolled-up "Other".

6. **`colSpan={7}` on a 5-column table** in the payments page. Corrected to the
   real column count (6, after adding Paid by).

7. **Effect-driven derivation on reviews.** `loadReviews` was an `async` function
   reading query results, called once from a `useEffect(() => {...}, [])`. It
   duplicated `isLoading`/`error` state the query already owns, could not react to
   its own inputs, and fetched a `useQueryClient` it never used. Replaced with a
   `useMemo` — which is also what made date filtering possible, since an effect
   with `[]` deps would have ignored the window.

8. **Search didn't cover displayed data.** Reviews searched `userID` but
   displayed `userSnapshot.fullname`; payments now search the payer name.

---

## 11. Known limits

- **"New customers" cannot be sliced further than window + granularity.** The
  backend exposes only a pre-aggregated daily count. ±1-day attribution caveat:
  the aggregate discards time-of-day, so each UTC day is treated as UTC midnight
  and then bucketed locally. Exact for UTC+8; a one-day shift near midnight
  elsewhere.
- **`resolveWindow` is memoised, so a page left open across midnight keeps its
  original "Last 7 days" bounds.** Acceptable for a dashboard session; a
  production fix is a time-based invalidation key.
- **All-time windows have no delta** — there is no meaningful prior period.
- **Inventory cards were removed** from the dashboard. "Currently rented" was a
  literal duplicate of "Active rentals" (same expression), and inventory detail
  belongs on the inventory page.
- **`/api/admin/user-count` and `/api/admin/admin-accounts` are still
  unauthenticated** — pre-existing, deliberately not silently changed.
  `authenticateToken` reads `req.cookies?.token` against
  `process.env.ACCESS_TOKEN_SECRET`.
- **No Mongoose `populate` anywhere in this codebase.** Joins are manual, which
  is exactly what made client-side filtering of `payment.status` and
  `payment.method` possible in the first place.

---

## 12. Verification

```
frontend:  npx tsc --noEmit          clean
           npm run lint              0 errors (37 pre-existing warnings, none in touched files)
           npm run build             compiled successfully
backend:   npx tsc --noEmit          clean
```

Behavioural checks are still yours: switch presets on each page, type an
inverted custom range, and confirm the Payments column and name search against
real records.
