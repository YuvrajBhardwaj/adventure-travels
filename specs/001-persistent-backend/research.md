# Research: Persistent Customer Backend

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-10-16

Each entry: **Decision**, **Rationale**, **Alternatives considered**. Together they resolve every "NEEDS CLARIFICATION" in the plan's Technical Context.

---

## R1. Where customer data lives

- **Decision**: Keep **Supabase** (Postgres + Auth + Realtime) as the single store. Extend the existing schema with additive, idempotent SQL migrations.
- **Rationale**: The schema, row-level security (RLS) policies, auth and realtime admin feed already exist in this repo (`supabase-schema.sql`, `supabase-activity-payments.sql`, `supabase-backend.sql`, `supabase-room-sharing.sql`). RLS lets the browser read a customer's own data with no custom API, which keeps the serverless function count low (see R3). Auth already supports email/password and Google.
- **Alternatives considered**:
  - Prisma + managed Postgres: this would create a second source of truth and needs a server runtime, but the site is a static export.
  - Firebase: a full rewrite of auth and data with no gain.

## R2. Where server logic runs

- **Decision**: Use **Vercel Node.js functions** in `adventure-travel/api/` (CommonJS, Node 22), as the existing functions do.
- **Rationale**: `next.config.ts` uses `output: "export"`, so Next.js route handlers and server actions are unavailable. Plain functions in `api/` already deploy alongside the static export and are proven in production (`course-bookings`, `geo`, `rates`).
- **Alternatives considered**:
  - Supabase Edge Functions: this would split the backend across two platforms and two secret stores.
  - Dropping static export: a large architectural change outside this feature.

## R3. Function count and plan limits

- **Decision**: Keep the deployment at **8 functions**, by consolidating by concern:
  - `bookings`: trek and course creation. It replaces `course-bookings`.
  - `create-order`, `verify-payment` and `razorpay-webhook`.
  - `account`: claims signed-out bookings and handles deletion. It replaces `claim-bookings`.
  - `cron`, `geo` and `rates`.
- **Rationale**: Vercel's Hobby plan caps serverless functions per deployment (12 at the time of writing; **verify on the account's current plan**). The current 7, plus naive one-function-per-action growth, would hit that cap. Admin operations need no function, because they run through RLS (R11).
- **Alternatives considered**:
  - One "router" function for everything: one cold start and blast radius for all traffic, and harder to secure the webhook's raw body.
  - Upgrading to Pro: valid later, but it shouldn't be required for this feature.

## R4. Locking the price when a booking is created (FR-016, FR-017)

- **Decision**: Create **all** priced bookings (treks *and* courses) through `api/bookings`. It computes `amount` from the generated catalogs (`api/_lib/catalog.js` with room-sharing tiers, and `api/_lib/courseCatalog.js` with packages and stays) and stores it on the row. Remove the browser's INSERT policy on `trek_bookings`. Bookings the catalog can't price get `amount = null` and `quote_required = true`.
- **Rationale**: Today trek bookings are inserted by the browser and priced only at payment time, so a catalog change between booking and payment changes the charge (it violates FR-016). Server creation also allows a server-side activity log entry and confirmation emails (FR-030) in one place.
- **Alternatives considered**:
  - A catalog table in Postgres plus a trigger: this duplicates `src/data/*.ts`, which is the source the site renders from.
  - Keeping the browser insert and stamping the price by trigger: the trigger would still need a catalog inside the database.

## R5. Advance, balance and full payments without races (FR-020 to FR-020f, FR-025)

- **Decision**: Every booking stores `amount`, `amount_paid`, `payment_state` and `balance_due_date`. Each Razorpay order is one **payment kind**: `advance`, `balance` or `full`. A Postgres function **`apply_payment(order_id, payment_id, amount, method)`** applies a captured payment atomically:
  - It locks the booking row (`SELECT … FOR UPDATE`).
  - It is idempotent on `razorpay_payment_id`.
  - It increments `amount_paid` and moves `payment_state`.
  - It sets `status = 'confirmed'` on the first successful payment.
  - It writes the status event.
  
  The function is `SECURITY DEFINER`, executable only by `service_role`. Both `verify-payment` and the webhook call it.
- **Rationale**: Both the browser confirmation and the webhook can report the same payment at nearly the same moment. Today's JavaScript read-then-update can double-apply once amounts are cumulative. A single locked transaction in the database is the simplest correct option.
- **Amount rules**:
  - advance = 30% of `amount`, rounded **up** to a whole rupee.
  - balance = `amount − amount_paid`.
  - full = `amount − amount_paid` when nothing is paid.
  - The server rejects an `advance` when anything is already paid or the start date is ≤ 15 days away, in Asia/Kolkata time.
  - `balance_due_date` = start date − 15 days.
- **Alternatives considered**:
  - Razorpay "partial payments" on a single order: this ties the balance to one order's lifetime and gives less clarity in history.
  - A JavaScript-side lock: there is no shared memory across serverless invocations.

## R6. Scheduled work: balance reminders and email retries (FR-020d, FR-032)

- **Decision**: Add **one Vercel Cron job** that runs daily at 03:30 UTC (09:00 IST) and calls `api/cron`, authenticated with the `CRON_SECRET` header that Vercel sends. The job:
  1. Queues reminders for bookings whose balance is due in 7 days or today.
  2. Retries failed notifications (maximum 3 attempts).
  3. Logs overdue balances for the admin view.
  
  This needs a new `vercel.json` containing only the `crons` entry.
- **Rationale**: Reminders work at day granularity. The Hobby plan allows daily cron jobs, which is exactly the need.
- **Alternatives considered**:
  - Supabase `pg_cron` + `pg_net`: this moves email composition into SQL.
  - GitHub Actions on a schedule: another place to keep secrets.
  - Sending reminders on page visits: unreliable.

## R7. Email delivery that never loses a booking (FR-030 to FR-032)

- **Decision**: Use an **outbox table** (`notifications`). The booking or payment is committed first. Then a `notifications` row is inserted with a unique `dedupe_key` (for example `booking-confirmed:<id>`, `reminder-7d:<id>`), then a send is attempted, then the row is marked `sent` or `failed`. The cron retries failed rows. Sending stays on **SMTP via nodemailer** (already a dependency), behind one `sendEmail()` helper so the provider can be swapped.
- **Rationale**:
  - The outbox gives "saved before notified", retries, and no duplicate emails from webhook/verify races, thanks to the unique `dedupe_key`.
  - Gmail SMTP (around 500/day) covers expected volume.
- **Alternatives considered**:
  - Resend or Postmark: better deliverability, but they need domain DNS setup. This is recommended as a later swap, and the helper makes it a one-file change.
  - Sending inline with no record: failures are invisible and can't be retried.

## R8. Auth emails and password reset (FR-002, FR-004)

- **Decision**:
  - Configure **custom SMTP in Supabase Auth**, using the same mailbox, for sign-up confirmations and password resets.
  - Add a `/reset-password` page that handles the recovery session and sets a new password.
  - Keep "Confirm email" enabled.
- **Rationale**: Supabase's built-in auth email sender is heavily rate-limited and intended for development. Production sign-ups would silently fail to receive confirmations.
- **Alternatives considered**: Magic-link-only sign-in. This changes the product, which the spec says uses email/password plus Google.

## R9. One account per email across sign-in methods (FR-003)

- **Decision**: Rely on Supabase's **automatic identity linking**. A Google sign-in whose verified email matches an existing *verified* account is attached to that account. Email confirmation must stay on (R8) so password accounts are verified.
- **Rationale**: This meets FR-003 without custom code.
- **Risk to validate in quickstart**: an *unverified* password account plus a Google sign-in with the same email. This must be checked in V3 (quickstart). If Supabase creates a second user, add a sign-in check that blocks it and asks the user to verify the email first.

## R10. Removing the browser-only fallback and the migration notice (FR-050, FR-051, FR-061)

- **Decision**:
  - Delete the localStorage branches from `src/lib/auth.ts`.
  - When Supabase settings are missing, show "Accounts are temporarily unavailable", with a WhatsApp fallback, instead of a fake success.
  - Fail **production** builds when `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are absent.
  - Add a `LegacyDataNotice` component. It detects the old keys (`eht_users`, `eht_session`, `eht_trek_bookings`, `eht_activity_bookings`), shows the one-time notice with a WhatsApp link, and removes those keys **when shown**.
- **Rationale**: The fallback is what makes production "work" while silently losing data. It also stores readable passwords.
- **Alternatives considered**: Keeping the fallback for local development. Rejected, because it is exactly the false-success path FR-061 forbids. Developers use a Supabase dev project instead.

## R11. Admin operations (FR-040 to FR-046)

- **Decision**:
  - Admin screens (`/admin/bookings`, `/admin/customers`, `/admin/payments`, plus the existing `/admin/activity`) read and update through the browser Supabase client under **RLS admin policies** (`is_admin()` reads `app_metadata.role`, which only the service role can set).
  - A database **trigger** writes every status or payment-state change to `booking_status_events`, with `changed_by = auth.uid()`, and mirrors it into `activity_logs` as `ADMIN_STATUS_CHANGE`.
  - Search uses `ilike` on indexed columns. That's sufficient at the expected scale.
- **Rationale**: There's no extra function, and the authorization lives in one place (RLS). The trigger guarantees an audit trail even for edits made outside the UI.
- **Alternatives considered**: An admin API using the service role. That's more code and another authorization layer to keep in sync.

## R12. Account deletion and record retention (FR-070)

- **Decision**: `api/account` (action `delete`) uses the service role to:
  1. Anonymise the profile (name, phone, city and emergency contact cleared).
  2. Scrub the contact fields on that customer's bookings.
  3. Delete the auth user.
  
  The foreign keys change to `ON DELETE SET NULL` for `user_id` on bookings and payments, and to `ON DELETE RESTRICT` from payments to bookings, so **payment records survive**.
- **Rationale**: Today every foreign key cascades. Deleting a user would delete their bookings and therefore their payments, which conflicts with the business's duty to keep financial records.
- **Alternatives considered**: A soft-delete flag only. That leaves personal data in place, which doesn't honour the deletion request.

## R13. Testing approach

- **Decision**: Add **Vitest** as a dev dependency, used only for pure server logic in `api/_lib/`:
  - pricing, including room tiers and course packages
  - advance, balance and due-date rules, including the IST boundary
  - signature verification
  - notification dedupe keys
  
  SQL behaviour (`apply_payment` idempotency, RLS isolation) and the end-to-end flows are validated by the scripted scenarios in [quickstart.md](./quickstart.md), using Razorpay **test mode**. `tsc` and `eslint` stay the build gates.
- **Rationale**: This is money logic, and the repo has no tests today. A small, fast unit layer catches pricing and rounding bugs without standing up a database in CI.
- **Alternatives considered**:
  - No tests: rejected, because of the money logic.
  - Full Playwright E2E with a seeded Supabase: worthwhile later, but too heavy for this feature.

## R14. Activity booking requests (FR-013)

- **Decision**: Add a "Request this activity" form on `/activities`. It writes `activity_bookings` through the browser client under the existing RLS insert policy (signed-in users). These are never payable, and admins price and confirm them.
- **Rationale**: The table and policy already exist, but no screen creates activity bookings today. Activity prices vary ("₹5,000+ / session"), so server pricing doesn't apply.

## R15. Platform risks to flag to the business

- **Supabase free tier**: free projects are paused after a period of inactivity, and have database and email limits. Run production on a paid tier, or at least monitor it. (**Verify current terms.**)
- **Vercel Hobby**: it limits the function count and cron frequency (R3, R6), and Hobby is for non-commercial use under Vercel's terms. A commercial booking site should plan for **Pro**. (**Verify current terms.**)
- **Razorpay**: international cards must be enabled on the account to take payments from abroad (UPI is India-only).
