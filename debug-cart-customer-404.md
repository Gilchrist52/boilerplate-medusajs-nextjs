# Debug Session: `cart-customer-404`

Status: [OPEN]

## Symptom

- `POST /fr/products/dji-mavic-3-classic` returns `500`
- underlying Medusa request `POST /store/carts` returns `404`
- error message: `Customer with id: cus_01KV6QN99E1C5ACWJMHQCHHMF1 was not found`

## Scope

- cart creation / add-to-cart flow
- likely affects authenticated storefront sessions with stale auth state

## Hypotheses

1. The storefront JWT in `_medusa_jwt` is still present, but references a deleted or non-seeded customer.
2. `getAuthHeaders()` is attaching `authorization` to cart creation even when the session is no longer valid, causing Medusa to resolve a missing customer and reject cart creation.
3. The seed reset or DB recreation invalidated previously issued customer identities, but browser cookies were kept.
4. The failure happens before rental-specific logic and affects both sale and rental add-to-cart paths because `getOrSetCart()` creates the cart first.
5. The error only happens on cart creation, not on line-item creation, so the failing observation point is `sdk.store.cart.create()` inside `getOrSetCart()`.

## Plan

1. Add instrumentation only around auth header resolution and cart creation.
2. Reproduce the failure and inspect whether a stale auth token is being sent.
3. Confirm or reject the hypotheses from runtime evidence.
4. Apply the minimal fix once evidence is clear.
