# Contract: Direct Browser ↔ Database Access

The browser talks to Supabase directly with the **anon key and the user's session**. RLS (see [data-model.md § Access control](../data-model.md#access-control-rls-matrix)) is the only authority. Anything not listed here must go through [http-api.md](./http-api.md).

## Customer (signed in)

| Operation | Table / call | Notes | Requirements |
|---|---|---|---|
| Sign up / in (password) | `auth.signUp`, `auth.signInWithPassword` | email confirmation required | FR-002 |
| Sign in with Google | `auth.signInWithOAuth({ provider: "google", redirectTo: "/dashboard" })` | identities auto-linked on a verified email | FR-003 |
| Reset password | `auth.resetPasswordForEmail(email, { redirectTo: "/reset-password" })`, then `auth.updateUser({ password })` | the new `/reset-password` page | FR-004 |
| Read / update profile | `profiles` select/update `id = auth.uid()` | the update also syncs `user_metadata.full_name/phone` | FR-005 |
| List bookings | `trek_bookings`, `course_bookings`, `activity_bookings` where `user_id = auth.uid()` | includes `amount`, `amount_paid`, `payment_state`, `balance_due_date` | FR-014 |
| Cancel a booking | `trek_bookings.update({ status: "cancelled" })` | RLS allows it only while `status = pending` and `payment_state = unpaid` | FR-015 |
| Request an activity | `activity_bookings.insert` | never priced or payable | FR-013 |
| Payment history | `payments` select own, with embedded booking names | | FR-027 |
| Booking history | `booking_status_events` for own bookings | the dashboard timeline | |
| Log client events | `activity_logs.insert` (`LOGIN`, `SETTINGS_UPDATE` only) | fire-and-forget | FR-044 |

## Admin (`app_metadata.role = "admin"`)

| Operation | Table | Notes | Requirements |
|---|---|---|---|
| List / search / filter bookings | the three booking tables | `ilike` on name, email, phone, id prefix; filter by type, status, payment_state, date; overdue = derived | FR-041 |
| Change status | booking `update({ status })` | the trigger writes `booking_status_events` (with `changed_by`) and an `ADMIN_STATUS_CHANGE` log | FR-042, FR-046 |
| Record a refund | booking `update({ payment_state: "refunded" })` | the trigger only allows `refunded` from an admin | FR-028 |
| Customers | `profiles` select all, joined to bookings and payments | | FR-043 |
| Payments | `payments` select all | | FR-041 |
| Activity timeline | `activity_logs` select plus a realtime subscription | existing feed | FR-044 |
| Failed emails | `notifications` select where `status = failed` | read-only | FR-032 |

## Never from the browser
- Inserting trek or course bookings (prices must be server-computed, FR-016).
- Any write to `payments`, `notifications` or `booking_status_events`.
- Setting `app_metadata`, `amount`, `amount_paid` or `balance_due_date`.
