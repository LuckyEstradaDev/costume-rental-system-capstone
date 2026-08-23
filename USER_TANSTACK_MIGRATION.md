# User Dashboard TanStack Query Migration

## Overview

The user dashboard data-fetching flows were migrated from manual API calls inside `useEffect` to TanStack Query. The migration follows the existing admin-dashboard pattern and keeps UI markup and interaction state unchanged.

**Migration date:** August 2026  
**Scope:** `frontend/app/(protected)/dashboard` and related user-dashboard services

## Migrated Areas

### Browse collection

`browse/page.tsx` was already using TanStack Query with the `outfits` query key. No UI changes were required.

`browse/[slug]/page.tsx` now uses two queries:

- `['outfit', outfitId]` loads the selected outfit.
- `['outfit-reviews', outfitId]` loads reviews for that outfit.

The selected variant, selected size, AR display, and add-to-cart loading state remain local component state.

### Orders

`orders/page.tsx` now uses:

- `['user-orders', userId]` for the authenticated user's orders and rentals.
- `enabled: Boolean(userId)` so the request does not run before authentication is available.

`orders/[id]/page.tsx` now uses:

- `['user-order', orderId]` for order details.
- `['stripe-session', orderId, userId, paymentId]` for the online payment client secret.

The payment dialog open state remains local. Review data is provided by the shared review query hook.

### Reviews

`features/user-dashboard/review/hooks/useReview.ts` now uses:

- `['user-reviews', userId]` for the authenticated user's reviews.

After a review is created or updated, the order-details page invalidates this query through `useQueryClient`, causing the existing review display to refresh.

### Cart

`cart/page.tsx` now loads the user's cart with:

- `['cart', userId]`

Missing outfit prices are loaded in parallel with `useQueries`, using the shared outfit query key:

- `['outfit', outfitId]`

The cart's local state is retained for quantity changes and for the existing `CartList` and `CartItem` component contracts. Removing an item continues to refresh the cart through the query-backed `refreshCart` function.

### Checkout

`cart/checkout/page.tsx` now loads missing outfit prices with `useQueries`, using one `['outfit', outfitId]` query per unique outfit. Checkout mode, form values, and selected checkout items remain local state.

## Service Type Updates

`features/user-dashboard/orders/services/orderService.tsx` now exports the typed `UserOrdersResponse` shape and returns unwrapped data:

```ts
export interface UserOrdersResponse {
  orders: IOrder[];
  rents: IRent[];
}
```

The order-details service returns `IOrder | IRent` directly instead of an Axios response wrapper.

`features/user-dashboard/cart/services/cartService.tsx` now returns `ICartItem` directly from `fetchCartItemsService`.

## Query and Mutation Pattern

Queries use stable resource keys and route or user identifiers when the data is scoped:

```tsx
const {
  data: ordersData,
  isLoading,
  isError,
} = useQuery({
  queryKey: ["user-orders", user?._id],
  queryFn: () => fetchOrdersByUserIdService(user!._id!),
  enabled: Boolean(user?._id),
});
```

UI-only state remains in `useState`. Server data is read through `useQuery` or `useQueries`, and related data is refreshed with `queryClient.invalidateQueries` after mutations.

## Intentionally Unchanged

- No rendered UI or styling was changed.
- Auth redirect/loading behavior in `dashboard/layout.tsx` remains unchanged.
- Cart quantity editing remains local because existing cart components receive state setters.
- Checkout and payment submission services remain mutation flows owned by their existing form components.

## Validation

The frontend TypeScript check passes:

```text
frontend/node_modules/.bin/tsc.cmd --noEmit --project frontend/tsconfig.json
```

No TypeScript errors were reported.
