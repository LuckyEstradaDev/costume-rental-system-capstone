# Reservation & Payment Manual QA Checklist

Use this checklist to verify the full reservation/payment process for purchases, rentals, packages, and admin handling.

## Test setup

- [ ] Use a development/staging database and PayMongo test credentials only.
- [ ] Use a customer account and an admin account.
- [ ] Seed at least one purchasable outfit, one rentable outfit, one purchase package, and one rental package with visible stock counts.
- [ ] Record `T` = order total, `R` = 50% reservation amount, and `B` = remaining balance (`B = T - R`).
- [ ] Confirm only QR Ph is enabled; card, GCash, and Maya should show “Soon to be implemented”.
- [ ] Check each completed case and record the order reference used.

---

## A. Checkout UI

- [ ] QA-001 — Reserve selection is a separate section

**Steps**

1. Open checkout for a single purchase.
2. Inspect the order form below the summary.

**Expected**

- `Reserve outfit (50%)` is its own bordered section above the payment method card.
- Selecting or clearing the reserve checkbox does not select Cash on hand or Online payment.
- The final payment method selection does not select or clear the reserve checkbox.

- [ ] QA-002 — Cash final payment with reservation

**Steps**

1. Select `Cash on hand`.
2. Check `Reserve outfit (50%)`.

**Expected**

- `Cash on hand` remains selected.
- The final online payment method picker is hidden.
- A `Reservation online payment method` picker appears inside the reserve section.
- The summary shows `Reservation payment (50%)` = `R` and `Remaining balance` = `B`.

- [ ] QA-003 — Online final payment without reservation

**Steps**

1. Select `Online payment`.
2. Leave `Reserve outfit (50%)` unchecked.

**Expected**

- The final online payment method picker appears under `Online payment`.
- No reservation payment method picker appears.
- The summary shows only the full total `T`.

- [ ] QA-004 — Online final payment with reservation

**Steps**

1. Select `Online payment`.
2. Check `Reserve outfit (50%)`.
3. Change the final online payment method.
4. Change the reservation online payment method.

**Expected**

- Two separate online method pickers are visible.
- The final picker only changes the final online payment method.
- The reservation picker only changes the reservation payment method.
- Both pickers can hold different values at the same time.

- [ ] QA-005 — Reservation picker toggling

**Steps**

1. Check `Reserve outfit (50%)`.
2. Clear the checkbox.
3. Check it again.

**Expected**

- The reservation picker appears and disappears with the checkbox.
- The previously chosen reservation method is retained when rechecked.
- Clearing the checkbox removes the reservation breakdown from the summary.

- [ ] QA-006 — Submit label

**Steps**

1. Keep final method as cash and reserve unchecked.
2. Observe the submit button.
3. Check reserve, then observe again.
4. Select online final payment, then observe again.

**Expected**

- Cash without reserve shows `Place Order`, `Place Rental`, or package equivalent.
- Reserve selected shows `Continue to payment`.
- Online final payment shows `Continue to payment`.

---

## B. Order creation

- [ ] QA-007 — Cash purchase without reservation

**Steps**

1. Place a non-reserved cash purchase.
2. Inspect the created order and payment document.

**Expected**

- Order status is `pending`.
- Payment method is `cash`.
- Payment status is `pending`.
- No reservation section/progress is present.
- No reservation intent is generated.

- [ ] QA-008 — Online purchase without reservation

**Steps**

1. Place a non-reserved online purchase.
2. Inspect the created order and payment document.

**Expected**

- Order status is `pending`.
- Payment method is the selected final online method.
- Payment status is `pending`.
- One full-amount intent for `T` is created when payment starts.
- No reservation fields are set.

- [ ] QA-009 — Cash purchase with reservation

**Steps**

1. Place a cash purchase with reserve selected.
2. Choose a reservation method different from the default where possible.
3. Inspect the created order and payment document.

**Expected**

- Order status is `reserved`.
- Top-level payment method is `cash` and status is `pending`.
- `payment.reservation.requested` is `true`.
- `payment.reservation.status` is `pending`.
- `payment.reservation.amount` is `R`.
- `payment.reservation.method` is the reservation picker value, not the final method.
- `payment.reservation.deadlineAt` is approximately 24 hours after order creation.

- [ ] QA-010 — Online purchase with reservation

**Steps**

1. Place an online purchase with reserve selected.
2. Use different final and reservation methods where possible.
3. Inspect the created order and payment document.

**Expected**

- Order status is `reserved`.
- Top-level payment method is the final picker value.
- `payment.reservation.method` is the reservation picker value.
- No top-level `paymentIntentId` exists yet.
- No nested reservation intent exists until payment starts.

- [ ] QA-011 — Cash rental with reservation

**Steps**

1. Repeat QA-009 for a single rental.
2. Repeat with a rental package.

**Expected**

- Same reservation fields and status as QA-009.
- Rental lifecycle progress still begins with Placed → Reserved.

- [ ] QA-012 — Online package purchase/rental with reservation

**Steps**

1. Repeat QA-010 for a purchase package.
2. Repeat QA-010 for a rental package.

**Expected**

- Same reservation fields and status as QA-010.
- Package items and total are preserved.
- Reservation amount is still 50% of the package total.

---

## C. Reservation payment

- [ ] QA-013 — Reservation payment page before payment

**Steps**

1. Open the payment status page from a newly reserved order.

**Expected**

- Page title is `Complete your payment`.
- Page shows `Reservation payment (50%)`.
- Amount shown is `R`.
- Deadline text is displayed from `reservation.deadlineAt`.
- Remaining balance copy says cash at pickup for cash final payment, or second online payment for online final payment.
- The selected method shown matches `reservation.method`.

- [ ] QA-014 — Generate reservation intent

**Steps**

1. Click `Generate QR code` or `Pay reservation`.
2. Inspect the PayMongo request and payment document.

**Expected**

- Intent amount is `R`, not `T` or `B`.
- Description starts with `Reservation`.
- Intent ID is stored in `payment.reservation.paymentIntentId`.
- Top-level `payment.paymentIntentId` remains unset.

- [ ] QA-015 — Successful reservation webhook

**Steps**

1. Pay the reservation in PayMongo test mode.
2. Wait for the webhook and refresh the status page.

**Expected**

- `payment.reservation.status` is `paid`.
- `payment.reservation.paidAt` is set.
- `payment.reservation.refundableUntil` is 5 days after `paidAt`.
- `payment.reservation.stockDeducted` is `true`.
- `payment.status` is still `pending`.
- Order status is still `reserved`.
- Stock was deducted once.

- [ ] QA-016 — Failed reservation webhook and retry

**Steps**

1. Start a reservation payment.
2. Trigger a failed payment webhook.
3. Refresh and start payment again.

**Expected**

- `payment.reservation.status` is `failed`.
- A new reservation intent can be created.
- Stock is not deducted while reservation payment is failed.
- Status page remains retryable, not terminal.

- [ ] QA-017 — Duplicate reservation webhook

**Steps**

1. Pay a reservation successfully.
2. Replay the same `payment.paid` webhook.

**Expected**

- Reservation remains `paid`.
- Stock is deducted only once.
- No duplicate payment state change or duplicate reservation paid timestamp.

- [ ] QA-018 — Reservation paid after deadline

**Steps**

1. Create a reservation with a deadline already in the past or advance the test clock.
2. Pay the reservation intent.

**Expected**

- Webhook marks `payment.reservation.status` as `expired`.
- Stock is not deducted.
- Order is not moved to ready.

---

## D. Reservation progress and status pages

- [ ] QA-019 — Reserved step is green

**Steps**

1. Open customer order details for an order with status `reserved`.
2. Inspect the order progress.
3. Repeat on the admin order details and payment status pages.

**Expected**

- A `Reserved` step is visible.
- The `Reserved` step is green/completed.
- The next step is active.
- The connector into `Reserved` is green.

- [ ] QA-020 — Reservation facts on customer order details

**Steps**

1. Open order details before reservation payment.
2. Pay the reservation.
3. Refresh order details.

**Expected**

- Before payment: shows reservation status, `Reservation payment (50%)` = `R`, and pay-by date.
- After payment: shows reservation status, reservation paid-at date, and `Remaining balance` = `B`.
- Payment method shown before payment matches `reservation.method`.
- Payment method shown after payment matches the final payment method.

- [ ] QA-021 — Cash reservation paid status copy

**Steps**

1. Pay the reservation for a cash-final order.
2. Open the payment status page.

**Expected**

- Title is `Payment successful`.
- Copy states the reservation is confirmed and remaining balance is paid in cash at pickup.
- Summary amount is `B`.
- Summary label says `Remaining balance`.

- [ ] QA-022 — Online reservation paid status copy

**Steps**

1. Pay the reservation for an online-final order.
2. Open the payment status page.

**Expected**

- Title is `Complete your payment`.
- Copy says to pay the remaining balance online.
- Summary amount is `B`.
- Remaining-balance panel is shown.
- Method shown is the final online method, not the reservation method.

- [ ] QA-023 — Cancelled progress step placement

**Steps**

1. Cancel an order from `reserved`.
2. Inspect progress on customer and admin details.

**Expected**

- Progress ends with a separate red `Cancelled` step.
- Completed steps before Cancelled remain green.
- Reserved remains before Cancelled.
- Cancelled is not substituted over the Reserved step.

---

## E. Final payment — cash on hand

- [ ] QA-024 — Ready guard before reservation payment

**Steps**

1. Create a cash-final reserved order.
2. Try to move it to `ready` from admin.

**Expected**

- Transition is blocked.
- Error states that reservation payment must be paid before the order is ready.
- `Mark as paid` is unavailable.

- [ ] QA-025 — Ready after reservation payment

**Steps**

1. Pay the reservation.
2. Move the order to `ready` from admin.

**Expected**

- Transition succeeds.
- Admin order detail shows `Mark as paid`.
- Order progress still shows Reserved as green.

- [ ] QA-026 — Cash amount below balance

**Steps**

1. Open the cash payment modal.
2. Enter an amount less than `B`.
3. Confirm.

**Expected**

- Validation rejects the amount.
- Error says cash must be at least the remaining balance.
- Payment status remains unchanged.

- [ ] QA-027 — Cash final payment success

**Steps**

1. Enter `B` or more.
2. Confirm cash payment.

**Expected**

- Top-level `payment.status` is `paid`.
- `payment.cash` stores the cash received.
- `payment.change` is cash received minus `B`, not minus `T`.
- `payment.reservation.status` remains `paid`.
- Customer order detail shows the final payment method as cash.

- [ ] QA-028 — No online balance intent for cash final payment

**Steps**

1. For a cash-final reserved order, call the payment endpoint after reservation payment.

**Expected**

- Request is rejected.
- Error states remaining balance must be paid in cash.
- No new PayMongo intent is created.

---

## F. Final payment — online

- [ ] QA-029 — Customer remaining payment CTA

**Steps**

1. Pay the reservation for an online-final order.
2. Open customer order details.

**Expected**

- Banner title is `Remaining payment needed`.
- Amount shown is `B`.
- CTA opens the payment status page.

- [ ] QA-030 — Balance intent

**Steps**

1. Click `Pay remaining balance`.
2. Inspect the PayMongo request and payment document.

**Expected**

- Intent amount is `B`.
- Description starts with `Balance`.
- Intent ID is stored in top-level `payment.paymentIntentId`.
- Nested `reservation.paymentIntentId` remains the reservation intent ID.

- [ ] QA-031 — Successful balance webhook

**Steps**

1. Pay the balance in PayMongo test mode.
2. Wait for webhook and refresh.

**Expected**

- Top-level `payment.status` is `paid`.
- `payment.paidAt` is set.
- `payment.reservation.status` remains `paid`.
- Order status remains unchanged by the webhook.
- Stock is not deducted again.

- [ ] QA-032 — Balance method isolation

**Steps**

1. Create an online reservation where reservation method and final method differ.
2. Pay reservation, then pay balance.
3. Inspect both intent requests.

**Expected**

- Reservation intent uses the reservation method selection.
- Balance intent uses the final method selection.
- Status page and order details show each method in the correct context.

- [ ] QA-033 — Mark-paid guard before reservation

**Steps**

1. Create an online reserved order.
2. Attempt to mark final payment paid before reservation payment.

**Expected**

- Request is rejected.
- Error states reservation payment must be paid before final payment.

---

## G. Admin handling

- [ ] QA-034 — Reserved status filter

**Steps**

1. Open admin orders.
2. Select the `Reserved` filter.

**Expected**

- Only orders with status `reserved` are listed.
- Purchases, rentals, and packages are included.

- [ ] QA-035 — Admin transaction facts

**Steps**

1. Open an admin reserved order with reservation paid.

**Expected**

- Final payment method is shown separately from reservation method.
- Reservation status and paid-at date are shown.
- Refundable-after date is shown.
- Remaining balance is `B` before final payment.

- [ ] QA-036 — Admin ready action

**Steps**

1. Open reserved order before reservation payment.
2. Open the same order after reservation payment.

**Expected**

- Before payment, `ready` is not available.
- After payment, `ready` is available.

- [ ] QA-037 — Admin final payment action by method

**Steps**

1. Open a reservation-paid cash order.
2. Open a reservation-paid online order.

**Expected**

- Cash order can be marked paid after ready.
- Online order does not expose manual `Mark as paid`; final online payment is handled by PayMongo.

- [ ] QA-038 — Refund action visibility

**Steps**

1. Cancel a paid reservation order.
2. Inspect admin actions.

**Expected**

- Refund action appears for paid/cancelled orders where a refund is still possible.
- Refund action does not appear for a plain unpaid non-reserved order.

---

## H. Cancellation, refund, and expiry

- [ ] QA-039 — Cancel reserved order before reservation payment

**Steps**

1. Create a reserved order.
2. Cancel it while reservation status is `pending`.

**Expected**

- Order status becomes `cancelled`.
- `cancelledFrom` is `reserved`.
- Payment status becomes `cancelled`.
- Reservation remains unpaid.
- No reservation is marked forfeited.
- Progress shows Cancelled after Reserved.

- [ ] QA-040 — Cancel within the 5-day reservation refund window

1. Pay only the reservation fee, then cancel the order less than 5 days after reservation `paidAt`.
2. Check the customer and admin order detail pages.

**Expected**

- The order and top-level payment status are `cancelled`. The reservation status remains `paid` and reserved stock is restored.
- The customer can request a refund for the fee. The admin can record the refund.

- [ ] QA-041 — Record a reservation refund within 5 days

1. From QA-040, record the reservation refund in admin.

**Expected**

- The top-level payment and reservation statuses become `refunded`.
- The customer order page shows "Payment refunded".

- [ ] QA-042 — Reservation refund eligibility at the cutoff

1. Pay only the reservation fee.
2. At or after 5 days from `paidAt`, cancel the order or reopen an order cancelled earlier.

**Expected**

- The customer sees that five days have passed since the reservation payment and cannot request a refund. The admin cannot record one.
- If the order is cancelled after the cutoff, the reservation becomes `forfeited` and reserved stock is restored.

- [ ] QA-043 — Refund a fully paid reservation order

1. Pay the reservation fee and then the remaining balance.
2. Cancel the order and record the refund in admin.

**Expected**

- The remaining balance is refundable regardless of the reservation refund window.
- The top-level payment status becomes `refunded`. The reservation status is preserved.

- [ ] QA-044 — 24-hour expiry

**Steps**

1. Create a reserved order.
2. Leave reservation unpaid.
3. Advance test clock past `deadlineAt`.
4. Start backend or wait for the 5-minute expiry job.

**Expected**

- Reservation status becomes `expired`.
- Payment status becomes `cancelled`.
- Order status becomes `cancelled` with `cancelledFrom` = `reserved`.
- Any deducted stock is restored.
- Notification is created for the customer.

- [ ] QA-045 — Payment after expiry

**Steps**

1. From QA-044, open the payment page or call the payment endpoint.

**Expected**

- Reservation payment cannot restart.
- Error says reservation payment is no longer available or the window has expired.
- No new PayMongo intent is created.

---

## I. Stock and regression checks

- [ ] QA-046 — No duplicate stock deduction at received/active

**Steps**

1. Pay reservation for a purchase and move it through ready to received.
2. Pay reservation for a rental and move it through ready to active, then returned.

**Expected**

- Stock is deducted once at reservation payment.
- Stock is not deducted again at received or active.
- Stock is restored once on cancellation/return path only.

- [ ] QA-047 — Non-reserved cash regression

**Steps**

1. Place a non-reserved cash order.
2. Move to ready.
3. Mark paid with full total `T`.

**Expected**

- No reserved step appears.
- Payment succeeds using `T`.
- Change is cash received minus `T`.

- [ ] QA-048 — Non-reserved online regression

**Steps**

1. Place a non-reserved online order.
2. Pay through the status page.

**Expected**

- One full-amount intent for `T` is created.
- Webhook marks top-level payment paid.
- No reservation fields are created.
- Existing progress remains unchanged.

- [ ] QA-049 — Disabled online methods

**Steps**

1. Open both online method pickers.
2. Attempt to select card, GCash, and Maya.

**Expected**

- Those options are disabled.
- Tooltip says `Soon to be implemented`.
- QR Ph remains selectable.

- [ ] QA-050 — Refresh persistence

**Steps**

1. Check reserve with a non-default reservation method.
2. Fill notes/event date.
3. Refresh checkout.

**Expected**

- Checkout state is local and resets after refresh.
- `Reserve outfit (50%)` is unchecked and both method pickers return to QR Ph.
- Re-select the intended methods before placing the order.
