# Package Building Wizard (User Workflow)

Frontend-only implementation of the package builder flow:
**Outfit → Color → Size → Amount**.

No API calls. This feature is ready for future cart/order integration.

## What Changed

### New files

| File | Purpose |
|---|---|
| `features/user-dashboard/package/components/StepIndicator.tsx` | 4-step progress bar showing active/completed/future steps |
| `features/user-dashboard/package/components/OutfitPickerStep.tsx` | Grid of package outfits; shows min-qty, stock, progress bar, and a "Done" badge once the outfit's minimum is met |
| `features/user-dashboard/package/components/ColorPickerStep.tsx` | Color swatches for the active outfit, with stock count and remaining-units hint |
| `features/user-dashboard/package/components/SizePickerStep.tsx` | Size buttons for the selected color; out-of-stock sizes are disabled |
| `features/user-dashboard/package/components/AmountPickerStep.tsx` | +/- quantity stepper; shows in-stock, still-needed, and max-allowed counts |
| `features/user-dashboard/package/components/SelectionSummary.tsx` | Editable list of committed selections grouped by outfit, with remove buttons and completion badges |

### Modified files

| File | Changes |
|---|---|
| `features/user-dashboard/package/providers/PackageProvider.tsx` | Expanded from 3 fields to a full wizard context: `currentStep`, `activeOutfit`, `selectedColor/Size/Amount`, `selections[]`, and helpers (`selectOutfit`, `selectColor`, `selectSize`, `commitSelection`, `removeSelection`, `goBack`, `goToOutfitStep`, `getMinQuantity`, `getOutfitCurrentQty`, `getOutfitRemaining`, `isOutfitComplete`, `getMaxAmount`). Provider now receives `packageItem` and `outfits` as props. `PackageContextValue` is exported for typed consumption. |
| `features/user-dashboard/package/hooks/usePackage.tsx` | Hook now returns the typed `PackageContextValue` instead of `any`. |
| `app/(protected)/dashboard/browse/package/[packageSlug]/page.tsx` | Refactored to compose the wizard components. Removed dead code (`VariantQuantityInputs`, old `OutfitDetails`, per-cell `quantities` state). Fixed a bug where clicking a color called `setSelectedSize` instead of setting the color. Price footer + totals now derive from committed selections. |

## Behavior

- **Outfit step** — pick one of the package's outfits. Progress bar + "Done" badge track completion.
- **Color step** — pick a color variant for the active outfit. Shows remaining units still needed to hit the package minimum.
- **Size step** — pick an in-stock size for that color.
- **Amount step** — set the quantity. The quantity is capped at `min(available stock, remaining units needed for the outfit's minimum)`.
- **Commit** — "Add to Package" stores the `(outfit, color, size, quantity)` tuple in provider state.
  - If the outfit still needs more units → loop back to the **Color** step (same outfit), showing a hint with the remaining count.
  - If the outfit has reached its minimum → auto-advance to the **Outfit** step and mark the outfit "Done".
- **Remove** — selections can be removed via the summary list; removing frees up the units so they can be re-allocated.
- **Add to cart** — validates that every outfit meets its package minimum, then shows a success notification. No API call yet; selections live in provider state.

## Suggested Next Steps (integration)

- `commitSelection` / `selections` can be persisted to `localStorage` for session retention.
- "Add to cart" should build an `ICartItem` from `selections` and call the existing `addToCartService`.
- When integrating per-item package prices, honor the package `mode` (`purchase` / `rental` / `both`) in the cart payload.