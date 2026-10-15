# Data Model: Persistent Customer Backend

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md) | **Date**: 2026-10-16

Money is stored as **integer paise (INR)** everywhere (FR-022). Every payment attempt is a `payments` row with amount, method, time and status (FR-023). Passwords exist only inside Supabase Auth as salted hashes and are never stored in application tables (FR-006). All tables are in the `public` schema with RLS enabled. "Existing" means it is already defined in `adventure-travel/supabase-*.sql`. "New" or "Change" means it goes in the new migration `adventure-travel/supabase-payments-v2.sql`, which is additive and idempotent and runs after the existing four files.

---

## Entities

### Customer Account (Supabase `auth.users`, existing)
| Field | Notes |
|---|---|
| id | uuid, primary key |
| email | unique; `email_confirmed_at` marks it verified |
| identities | password and/or Google. Auto-linked on a matching verified email (research R9) |
| app_metadata.role | `"admin"` for admins. Only the service role can write it (FR-040) |

### Profile (`profiles`, existing + change)
| Field | Type | Rules |
|---|---|---|
| id | uuid PK → auth.users | created by the `handle_new_user` trigger |
| full_name, phone, city | text | editable by the owner (FR-005) |
| emergency_contact_name, emergency_contact_phone | text | editable by the owner |
| email | text | copied from auth on creation |
| updated_at | timestamptz | touched by a trigger |
| **deleted_at** *(new)* | timestamptz null | set when the account is anonymised (FR-070) |

### Trek Booking (`trek_bookings`, existing + changes)
| Field | Type | Rules |
|---|---|---|
| id, created_at, updated_at | | existing |
| user_id | uuid → profiles | **change**: becomes nullable, `ON DELETE SET NULL` (R12) |
| trek_name, trek_slug, trek_date, group_size, message | | existing; `trek_date` must be in the future when created |
| room_sharing | text null | existing (`supabase-room-sharing.sql`); must be a label in the trek's `roomSharing` tiers |
| **amount** *(new)* | int null | paise, set by `api/bookings` when created; null means a quote is required (FR-016/017) |
| **quote_required** *(new)* | bool | true when the catalog can't price the booking (group > 10, unknown tier) |
| **amount_paid** *(new)* | int, default 0 | maintained only by `apply_payment` and admin refunds |
| **payment_state** *(new)* | text | `unpaid` · `advance_paid` · `fully_paid` · `refunded` |
| **balance_due_date** *(new)* | date null | trek_date − 15 days, set when the advance is applied |
| status | text | `pending` · `confirmed` · `cancelled` (existing check) |

### Course Booking (`course_bookings`, existing + changes)
Same additions as Trek Booking (`amount_paid`, `payment_state`, `balance_due_date`, `quote_required`). `amount` already exists. The start date is `preferred_date`. `user_id` stays nullable for signed-out bookings and gets `ON DELETE SET NULL`.

### Activity Booking (`activity_bookings`, existing)
Unchanged, request-only and never payable (FR-013). The admin sets the status. `user_id` changes to `ON DELETE SET NULL`.

### Payment (`payments`, existing + changes)
| Field | Type | Rules |
|---|---|---|
| id, razorpay_order_id (unique), razorpay_payment_id (unique), currency `INR`, method, failure_reason, created_at, paid_at | | existing |
| user_id | uuid | **change**: `ON DELETE SET NULL`, so records survive account deletion |
| booking_id / course_booking_id | uuid | exactly one is set (existing check). **Change**: `ON DELETE RESTRICT` |
| **kind** *(new)* | text | `advance` · `balance` · `full` |
| amount | int > 0 | the amount for *this* payment, computed by `create-order` (R5) |
| status | text | `created` · `paid` · `failed` |

### Booking Status Event (`booking_status_events`, new)
| Field | Type | Rules |
|---|---|---|
| id | uuid PK | |
| booking_type | text | `trek` · `course` · `activity` |
| booking_id | uuid | |
| from_status, to_status | text null | |
| from_payment_state, to_payment_state | text null | |
| changed_by | uuid null | `auth.uid()`; null when the system made the change (a payment) |
| note | text | for example "advance applied", "refund recorded" |
| created_at | timestamptz | |

Written **only** by triggers on the three booking tables (FR-042, FR-046). It can be read by admins, and by the booking's owner for their own bookings.

### Notification (`notifications`, new, the outbox, research R7)
| Field | Type | Rules |
|---|---|---|
| id | uuid PK | |
| kind | text | `booking_received` · `booking_alert` · `payment_receipt` · `payment_alert` · `balance_reminder_7d` · `balance_reminder_due` |
| dedupe_key | text **unique** | for example `payment_receipt:<payment_id>`; stops duplicate emails |
| recipient | text | an email address |
| subject, body_text | text | rendered when the row is queued |
| booking_type, booking_id, payment_id | | links |
| status | text | `pending` · `sent` · `failed` |
| attempts | int | at most 3; after that it is left `failed` for the admin |
| last_error | text | truncated to 300 characters |
| created_at, sent_at | timestamptz | |

Service role only (no browser policies). Admins can read it to see failed sends.

### Activity Event (`activity_logs`, existing + change)
Add the enum value `ADMIN_STATUS_CHANGE`. Everything else is unchanged.

### Catalogue Price (not a table)
Generated files `api/_lib/catalog.js` (treks: `price`, optional `roomSharing{label: price}`) and `api/_lib/courseCatalog.js` (courses: `price`, `tiers[{id, priceBase, priceFull}]`), built from `src/data/*.ts` by `npm run catalog`. This is the only input for amounts.

---

## Relationships

```text
auth.users 1─1 profiles
profiles   1─* trek_bookings      (user_id, nullable after deletion)
profiles   1─* course_bookings    (user_id, null = booked signed-out)
profiles   1─* activity_bookings
trek_bookings | course_bookings 1─* payments   (exactly one FK set per payment)
<any booking> 1─* booking_status_events
<booking|payment> 1─* notifications
profiles   1─* activity_logs
```

---

## State transitions

### Booking `status`
```text
pending ──(first successful payment via apply_payment)──▶ confirmed
pending ──(admin)──────────────────────────────────────▶ confirmed   (for example a quote paid offline)
pending ──(owner, only while payment_state = unpaid)────▶ cancelled   (FR-015)
pending | confirmed ──(admin)───────────────────────────▶ cancelled
cancelled ──(admin, to correct a mistake)───────────────▶ pending
```

### Booking `payment_state`
```text
unpaid ──advance applied──▶ advance_paid ──balance applied──▶ fully_paid
unpaid ──full applied─────────────────────────────────────────▶ fully_paid
advance_paid | fully_paid ──(admin records refund)────────────▶ refunded
```
**Derived "overdue"**: `payment_state = 'advance_paid' AND balance_due_date < today (Asia/Kolkata)`. This is shown to admins, and nothing happens automatically (FR-020e).

### Payment `status`
```text
created ──captured (verified)──▶ paid
created ──provider failure─────▶ failed ──(retry on the same order succeeds)──▶ paid
```

---

## Validation rules (enforced on the server)

| Rule | Where | Requirement |
|---|---|---|
| Amount = unit price (by room tier or course package and stay) × group size × 100 | `api/bookings` | FR-016 |
| Trek group size is 1–10 to be priced; otherwise `quote_required` | `api/bookings` | FR-017 |
| Course group size is 1–20 | `api/bookings` and a database check | existing |
| Start date is after today (IST) | `api/bookings` | |
| `advance` only when `amount_paid = 0` and the start date is more than 15 days away (IST) | `api/create-order` | FR-020, FR-020a |
| Advance amount = ceil(0.30 × amount) to whole rupees; balance = amount − amount_paid | `api/create-order` | FR-020 |
| No order for `cancelled`, `fully_paid`, `refunded` or `quote_required` bookings | `api/create-order` | FR-026 |
| A captured amount must equal the order amount | `apply_payment` | FR-024 |
| `apply_payment` is idempotent on `razorpay_payment_id` | database function | FR-025 |
| A signed-out course booking is claimed only by a verified, exactly equal lower-case email | `api/account` (claim) | FR-012 |

---

## Access control (RLS matrix)

| Table | Customer (own rows) | Admin | Browser insert | Service role |
|---|---|---|---|---|
| profiles | select, update | select | via trigger only | all |
| trek_bookings | select; update **only** pending + unpaid → cancelled | select, update | **removed** (now via `api/bookings`) | all |
| course_bookings | select; update **only** pending + unpaid → cancelled (FR-015) | select, update | none | all |
| activity_bookings | select, insert | select, update | own rows | all |
| payments | select | select | none | all |
| booking_status_events | select (own bookings) | select | none (trigger) | all |
| notifications | none | select | none | all |
| activity_logs | select own; insert LOGIN / SETTINGS_UPDATE | select | limited types | all |

Admin updates to `payment_state` are limited to setting `refunded`, enforced by a trigger check.
