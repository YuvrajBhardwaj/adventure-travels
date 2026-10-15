# Contract: Serverless HTTP API

All endpoints live under `/api/*` (Vercel Node functions in `adventure-travel/api/`).

- **Body format**: JSON in and out. Errors are `{ "error": "<customer-safe message>" }`.
- **Auth**: where required, send `Authorization: Bearer <Supabase access token>`.
- **Unconfigured dependencies**: if a required setting is missing, the endpoint returns **503** with a message the UI pairs with a WhatsApp fallback (FR-060, FR-061).

The function count is 8 (research R3). `bookings` replaces `course-bookings`, and `account` replaces `claim-bookings`.

---

## POST /api/bookings: create a trek or course booking
Auth: **required for treks**, optional for courses (attaches the account when present). Requirements: FR-010, FR-011, FR-016, FR-017, FR-030.

Request:
```json
{
  "type": "trek",
  "slug": "kedarkantha",
  "date": "2027-01-08",
  "groupSize": 2,
  "roomSharing": "Twin sharing",
  "message": "Vegetarian meals please"
}
```
```json
{
  "type": "course",
  "slug": "skiing-course",
  "tierId": "premium",
  "stay": "full",
  "date": "2027-01-10",
  "groupSize": 1,
  "contact": { "name": "A B", "email": "a@b.co", "phone": "9608467877" },
  "message": ""
}
```
`roomSharing` is only for treks that offer tiers. For courses, `contact` defaults to the profile when signed in.

Response **201**:
```json
{ "bookingId": "uuid", "type": "trek", "amount": 1200000, "quoteRequired": false,
  "advanceAllowed": true, "advanceAmount": 360000, "emailQueued": true }
```
- `amount` and `advanceAmount` are in paise. `amount` is null when `quoteRequired`.
- `advanceAllowed` is false when the start date is 15 days away or less.

Errors:
- **400**: validation failed (an unknown slug, tier or room, a past date, a bad group size).
- **401**: a trek booking without a session.
- **503**: there is no database. The booking is *not* saved and the UI must show the WhatsApp fallback.

Guarantees: the row is committed **before** any email is attempted (FR-032). Browser-sent prices are ignored.

---

## POST /api/create-order: start a payment
Auth: required, and the caller must own the booking. Requirements: FR-020 to FR-020a, FR-021 to FR-026.

Request:
```json
{ "bookingType": "trek", "bookingId": "uuid", "kind": "advance" }
```
`bookingType` is `"trek"` or `"course"`. `kind` is `"advance"`, `"balance"` or `"full"`.

Response **200**:
```json
{ "keyId": "rzp_…", "orderId": "order_…", "amount": 360000, "currency": "INR",
  "kind": "advance", "description": "Kedarkantha Trek · Twin sharing · 2 persons — 30% advance",
  "prefill": { "name": "", "email": "", "contact": "" },
  "summary": { "total": 1200000, "paid": 0, "dueAfterThis": 840000, "balanceDueDate": "2026-12-24" } }
```

Errors:
- **400**: a bad kind for the current state. Examples: `advance` after a payment, `balance` when nothing is paid, `advance` within 15 days.
- **401**: no valid session.
- **404**: the booking doesn't exist or isn't owned by the caller.
- **409**: the booking is cancelled, fully paid or refunded.
- **422**: `quote_required`.
- **503**: payments aren't configured.

Behaviour:
- An unpaid order with the same kind and amount is reused instead of creating a new one.
- A `PAYMENT_INITIATED` activity is logged.

---

## POST /api/verify-payment: browser confirmation after Checkout
Auth: required. Requirements: FR-024, FR-025.

Request: `{ "razorpay_order_id": "…", "razorpay_payment_id": "…", "razorpay_signature": "…" }`

Response **200**:
```json
{ "status": "paid", "paymentState": "advance_paid", "bookingStatus": "confirmed" }
```

Errors:
- **400**: the signature is invalid.
- **404**: the order isn't the caller's.
- **502**: a transient failure. The UI polls the booking and the webhook completes it.

Behaviour: it calls `apply_payment(...)` (idempotent), then queues `payment_receipt` and `payment_alert` with dedupe keys.

---

## POST /api/razorpay-webhook: provider callback (source of truth)
Auth: the `X-Razorpay-Signature` header is an HMAC-SHA256 of the **raw body** with `RAZORPAY_WEBHOOK_SECRET`. Requirements: FR-024, FR-025.

Events:
- `payment.captured` and `order.paid` lead to `apply_payment`, which rejects a mismatched amount and logs `PAYMENT_FAILED/amount_mismatch`.
- `payment.failed` marks the payment `failed` if it is still `created`.

Responses:
- **200**: handled, or ignored for unknown events.
- **400**: bad signature or payload.
- **500**: a database error, so Razorpay retries.

---

## POST /api/account: account actions
Auth: required.

| action | Request | Response | Requirements |
|---|---|---|---|
| `claim` | `{ "action": "claim" }` | `{ "claimed": 2 }`. Attaches signed-out course bookings whose `contact_email` exactly equals the caller's **verified** email, lower-cased | FR-012 |
| `delete` | `{ "action": "delete", "confirm": "DELETE" }` | `{ "deleted": true }`. Anonymises the profile and booking contacts, keeps payments, deletes the auth user | FR-070 |

Errors:
- **400**: an unknown action, or a missing `confirm` on delete.
- **401**: no valid session.

---

## GET /api/cron: daily jobs (Vercel Cron, 03:30 UTC)
Auth: `Authorization: Bearer <CRON_SECRET>`. Any other caller gets **401**. Requirements: FR-020d, FR-020e, FR-032.

Steps, each idempotent through `notifications.dedupe_key`:
1. For bookings with `payment_state = advance_paid` and `balance_due_date` equal to today + 7 days (IST), queue `balance_reminder_7d`.
2. For bookings due today, queue `balance_reminder_due`.
3. Retry `failed` notifications with `attempts < 3`.
4. Return `{ "reminders": n, "retried": n, "overdue": n }`.

---

## GET /api/geo and GET /api/rates (existing, unchanged)
These are display-currency support only. `geo` is never cached; `rates` is edge-cached for about 6 hours. They have no role in charging. All charges are in INR.
