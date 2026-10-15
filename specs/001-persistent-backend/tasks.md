---

description: "Task list for Persistent Customer Backend"
---

# Tasks: Persistent Customer Backend

**Input**: Design documents from `/specs/001-persistent-backend/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: The spec does not request TDD. The plan (research R13) adds **Vitest unit tests for money logic only** (`api/_lib/`). Those are included in the Foundational phase. Each story then ends with the quickstart validation scenarios (V1–V22) that prove it.

**Organization**: Tasks are grouped by user story so each story can be implemented, tested and shipped on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on unfinished tasks)
- **[Story]**: The user story the task belongs to (US1–US7, from spec.md)
- All paths are relative to the repository root. The app lives in `adventure-travel/`

## Ground rules for every task

- Money is **integer paise (INR)**. Never accept an amount from the browser.
- Run `npx tsc --noEmit` and `npx eslint <changed files>` from `adventure-travel/` after each task.
- **Never** run `npm run build` or delete `adventure-travel/.next` while `npm run dev` is running (check `http://localhost:3000` first).
- Many files use CRLF line endings, so normalise them before scripted multi-line replacements.
- `api/*.js` functions are CommonJS (`require`, `module.exports`). Shared server code goes in `adventure-travel/api/_lib/` (not deployed as functions).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Tooling and configuration every later phase relies on.

- [X] T001 Confirm the in-progress room-sharing work is committed before starting. `git status` must not show uncommitted changes to `adventure-travel/src/data/treks.ts`, `adventure-travel/api/create-order.js`, `adventure-travel/api/_lib/catalog.js` or `adventure-travel/supabase-room-sharing.sql`. If it does, stop and ask the owner to commit them.
- [X] T002 Add `vitest` as a devDependency and a `"test": "vitest run"` script in `adventure-travel/package.json`. Create `adventure-travel/vitest.config.mjs` with `test.environment = "node"` and `test.include = ["api/_lib/__tests__/**/*.test.js"]`.
- [X] T003 [P] Add `CRON_SECRET=` to `adventure-travel/.env.example` under a new "Scheduled jobs (api/cron)" heading, with the comment "Vercel sends this as `Authorization: Bearer <CRON_SECRET>` on cron calls".
- [X] T004 [P] Create `adventure-travel/vercel.json` containing **only** `{"crons":[{"path":"/api/cron","schedule":"30 3 * * *"}]}`, which is 09:00 IST daily. Do not add `outputDirectory`, `functions` or `runtime` keys; earlier commits removed those on purpose.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema, money logic, outbox and client plumbing that every story uses.

**⚠️ CRITICAL**: No user-story work can begin until this phase is complete.

### Database migration `adventure-travel/supabase-payments-v2.sql`

Additive and idempotent: use `if not exists`, `drop … if exists`, and `do $$ … exception when duplicate_object` patterns. Header comment: "Run AFTER supabase-room-sharing.sql".

- [X] T005 Write the booking/payment column changes in `adventure-travel/supabase-payments-v2.sql`:
  - `trek_bookings`: add `amount integer check (amount is null or amount > 0)`.
  - **both** `trek_bookings` and `course_bookings`: add
    - `quote_required boolean not null default false`
    - `amount_paid integer not null default 0 check (amount_paid >= 0)`
    - `payment_state text not null default 'unpaid' check (payment_state in ('unpaid','advance_paid','fully_paid','refunded'))`
    - `balance_due_date date`
  - `payments`: add `kind text not null default 'full' check (kind in ('advance','balance','full'))`.
  - `profiles`: add `deleted_at timestamptz`.
  - Add enum value `ADMIN_STATUS_CHANGE` to `public.activity_action`, using `alter type … add value if not exists` inside a `do` block.
- [X] T006 In `adventure-travel/supabase-payments-v2.sql`, change the foreign keys for record retention (research R12). Drop and recreate each constraint by its existing name (look up the name with `select conname from pg_constraint where conrelid = '<table>'::regclass and contype = 'f'`):
  - `trek_bookings.user_id`, `activity_bookings.user_id`, `course_bookings.user_id` and `payments.user_id`: make them nullable and `ON DELETE SET NULL`.
  - `payments.booking_id → trek_bookings(id)` and `payments.course_booking_id → course_bookings(id)`: `ON DELETE RESTRICT`.
- [X] T007 In `adventure-travel/supabase-payments-v2.sql`, rework the policies and add the audit:
  - (a) Drop policy `"Users can insert own trek bookings"` on `trek_bookings`; trek bookings now come only from `api/bookings`.
  - (b) Replace `"Users can cancel own pending trek bookings"` with `using (auth.uid() = user_id and status = 'pending' and payment_state = 'unpaid') with check (auth.uid() = user_id and status = 'cancelled')`. Add the same policy for `course_bookings`, named `"Users can cancel own pending course bookings"`.
  - (c) Create table `booking_status_events` with these columns, enable RLS, and add policies for admin select (`public.is_admin()`) and owner select (the owner of the referenced booking):
    - `id uuid pk default gen_random_uuid()`
    - `booking_type text not null check (booking_type in ('trek','course','activity'))`
    - `booking_id uuid not null`
    - `from_status text`, `to_status text`, `from_payment_state text`, `to_payment_state text`
    - `changed_by uuid`, `note text not null default ''`
    - `created_at timestamptz not null default now()`
  - (d) A `BEFORE UPDATE` guard trigger on `trek_bookings` and `course_bookings`. Unless `auth.role() = 'service_role'`, it raises an exception when `amount`, `amount_paid` or `balance_due_date` change. It also raises when `payment_state` changes, *except* that `public.is_admin()` may set `payment_state = 'refunded'`.
  - (e) An `AFTER UPDATE` trigger on all three booking tables. When `status` or `payment_state` changed, it inserts a `booking_status_events` row with `changed_by = auth.uid()`. When `public.is_admin()`, it also inserts `activity_logs (user_id = booking owner, action_type = 'ADMIN_STATUS_CHANGE', metadata = {booking_type, booking_id, from, to, admin_id})`, skipped when the booking owner is null.
- [X] T008 In `adventure-travel/supabase-payments-v2.sql`, create table `notifications`. Enable RLS with **only** an admin select policy, and add an index on `(status, attempts)`. Columns:
  - `id uuid pk default gen_random_uuid()`
  - `kind text not null check (kind in ('booking_received','booking_alert','payment_receipt','payment_alert','balance_reminder_7d','balance_reminder_due'))`
  - `dedupe_key text not null unique`
  - `recipient text not null`, `subject text not null`, `body_text text not null`
  - `booking_type text`, `booking_id uuid`, `payment_id uuid`
  - `status text not null default 'pending' check (status in ('pending','sent','failed'))`
  - `attempts integer not null default 0`, `last_error text`
  - `created_at timestamptz not null default now()`, `sent_at timestamptz`
- [X] T009 In `adventure-travel/supabase-payments-v2.sql`, create `public.apply_payment(p_order_id text, p_payment_id text, p_amount integer, p_method text) returns jsonb`, `language plpgsql security definer set search_path = public`. Then `revoke all … from public, anon, authenticated` and `grant execute … to service_role`. Its logic, in one transaction:
  1. `select … from payments where razorpay_order_id = p_order_id for update`. If none, return `{"result":"unknown_order"}`.
  2. If `status = 'paid'`, return `{"result":"already"}` with the current booking state.
  3. If `p_amount <> amount`, insert `activity_logs PAYMENT_FAILED {reason:'amount_mismatch'}` and return `{"result":"amount_mismatch"}`.
  4. Lock the booking (`trek_bookings` or `course_bookings` by whichever FK is set) `for update`.
  5. Update the payment: `status = 'paid'`, `razorpay_payment_id = p_payment_id`, `method = p_method`, `paid_at = now()`.
  6. Update the booking:
     - `amount_paid = amount_paid + p_amount`
     - `payment_state = case when amount_paid + p_amount >= amount then 'fully_paid' else 'advance_paid' end`
     - when the result is `advance_paid`, `balance_due_date = <start date> - 15`, where the start date is `trek_date` or `preferred_date`
     - `status = 'confirmed'` when it was `pending`
  7. Insert `activity_logs PAYMENT_SUCCESS` with `{order_id, payment_id, amount, kind, booking_type, booking_id}`.
  8. Return `{"result":"applied","booking_type","booking_id","payment_state","amount_paid","amount","status","user_id"}`.

### Server money logic and outbox

- [X] T010 [P] Create `adventure-travel/api/_lib/pricing.js` (CommonJS) exporting:
  - `trekAmount(trekCatalogItem, groupSize, roomSharing)`. Paise, or `null` when the trek has `roomSharing` tiers and the label is unknown, or `groupSize` is not an integer from 1 to 10.
  - `courseAmount(courseCatalogItem, tierId, stay, groupSize)`. Uses `stay === "full" ? priceFull : priceBase`, or `price` when there are no tiers. Group size must be 1–20.
  - `advanceAmount(amount)` = `Math.ceil(amount * 0.30 / 100) * 100`.
  - `balanceAmount(amount, amountPaid)` = `amount - amountPaid`.
  - `istDate(now = new Date())`. Today's date in Asia/Kolkata as `YYYY-MM-DD`.
  - `isAdvanceAllowed(startDateISO, amountPaid, now)`. True only when `amountPaid === 0` and the start date is **more than 15 days** after `istDate(now)`.
  - `balanceDueDate(startDateISO)`. The start date minus 15 days, as `YYYY-MM-DD`.
  - `isFutureStart(startDateISO, now)`.
- [X] T011 [P] Create `adventure-travel/api/_lib/__tests__/pricing.test.js` covering:
  - a trek with and without room tiers (using fixtures shaped like `api/_lib/catalog.js`)
  - group sizes 0, 1, 10 and 11
  - a course with base/full stay and with no tiers
  - advance rounding: ₹5,499 × 2 → advance 329,940 paise rounded up to 330,000
  - balance math
  - the advance cut-off at exactly 15 vs 16 days
  - the IST rollover: `2026-10-15T18:29Z` is the 15th and `18:31Z` is the 16th
- [X] T012 [P] Create `adventure-travel/api/_lib/notify.js` exporting:
  - `templates[kind](ctx) → { subject, bodyText }` for the six kinds in `specs/001-persistent-backend/contracts/notifications.md`. Plain text, INR amounts as `Rs.12,000`, and every customer email ends with the WhatsApp line `+91 78179 12062 (https://wa.me/917817912062)`.
  - `enqueue(db, { kind, dedupeKey, recipient, ctx, bookingType, bookingId, paymentId })`. Inserts with `upsert(..., { onConflict: 'dedupe_key', ignoreDuplicates: true })` and returns the new row or `null` when it is a duplicate.
  - `smtpReady()` and `sendOne(db, row)`. Use nodemailer with `SMTP_HOST`, `SMTP_PORT` (465 means secure), `SMTP_USER` and `SMTP_PASS`, and From `{ name: "Himalayan Arc Adventure", address: SMTP_USER }`. Mark the row `sent` with `sent_at`, or `failed` with `attempts + 1` and `last_error` truncated to 300 characters.
  - `enqueueAndSend(db, items)`. Never throws.
- [X] T013 [P] Create `adventure-travel/api/_lib/__tests__/notify.test.js`. Each template returns a non-empty subject and body. Customer kinds include the WhatsApp line. `payment_receipt` with an advance shows the remaining balance and due date and the words "non-refundable".
- [X] T014 Update `adventure-travel/api/_lib/payments.js`:
  - Replace `markPaid` with `applyPayment(db, { orderId, paymentId, amount, method })`. It calls `db.rpc('apply_payment', { p_order_id, p_payment_id, p_amount, p_method })`, and on `result === 'applied'` it calls `notify.enqueueAndSend` for `payment_receipt` (to the owner's email from `profiles.email`, or the course booking's `contact_email`) and `payment_alert` (to `BOOKING_TO_EMAIL || "himalayanarcadventure@gmail.com"`), with dedupe keys `payment_receipt:<paymentId>` and `payment_alert:<paymentId>`.
  - Keep `hmacHex`, `safeEqual`, `logActivity` and `markFailed`.
- [X] T015 [P] Create `adventure-travel/api/_lib/__tests__/payments.test.js` for `hmacHex` and `safeEqual`: equal, unequal, different lengths, and `undefined` input.

### Client plumbing

- [X] T016 Update `adventure-travel/src/lib/auth.ts`:
  - Delete every localStorage path: `LS_USERS`, `LS_SESSION`, `LS_TREK_BOOKINGS`, `LS_ACT_BOOKINGS`, `lsRead`, `lsWrite` and all fallback branches.
  - Export `class BackendUnavailableError extends Error` with the message "Accounts are temporarily unavailable. Please contact us on WhatsApp." When `createClient()` returns null, every function throws it, except `getSession`, which returns `null`.
  - Extend `TrekBooking` and `CourseBooking` with `amount: number | null`, `quote_required: boolean`, `amount_paid: number`, `payment_state: "unpaid" | "advance_paid" | "fully_paid" | "refunded"`, `balance_due_date: string | null`. Add `room_sharing: string | null` to `TrekBooking`.
- [X] T017 [P] In `adventure-travel/next.config.ts`, throw a clear error at config load when `process.env.VERCEL_ENV === "production"` and `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing (research R10). Local and preview builds are unaffected.
- [X] T018 [P] Create `adventure-travel/src/components/WhatsAppFallback.tsx`. Props `{ message: string; details?: string[] }`. It renders the message and a "Send these details on WhatsApp" link to `https://wa.me/917817912062?text=<encoded details joined by \n>`. Used by every form when the backend is unavailable (FR-061).

**Checkpoint**: Migration file complete, `npm test` passes, `tsc` is clean. Run the migration on the **dev** Supabase project (quickstart §2.1) before starting the stories.

---

## Phase 3: User Story 1 - My account and bookings follow me to any device (Priority: P1) 🎯 MVP

**Goal**: Accounts and trek, course and activity bookings live on the server, with the price locked when booking, and are visible on any device.

**Independent Test**: quickstart **V1, V2, V3, V4, V5, V18, V22**. Book on browser A, see it on browser B; the price stays locked after a catalog change; tampering is ignored.

- [ ] T019 [US1] Create `adventure-travel/api/bookings.js` implementing `POST /api/bookings` exactly as in `specs/001-persistent-backend/contracts/http-api.md`:
  - `type: "trek"` requires a session (401 otherwise). `type: "course"` takes an optional session.
  - Validate the slug against `api/_lib/catalog.js` or `api/_lib/courseCatalog.js` (400 if unknown). Validate the date with `pricing.isFutureStart`, and `groupSize` (trek 1–10 priced, larger → `quote_required = true`, `amount = null`; course 1–20).
  - Compute `amount` with `pricing.trekAmount` or `pricing.courseAmount`, **ignoring any amount in the body**.
  - Insert with the service-role client: `trek_bookings` (user_id, trek_name from the catalog, trek_slug, trek_date, group_size as text, room_sharing, message, amount, quote_required) or `course_bookings` (as today, plus quote_required, with `contact_email` lower-cased).
  - Log `BOOKING_CREATED` or `COURSE_BOOKING_CREATED`.
  - **After** the insert commits, `notify.enqueueAndSend` `booking_received` (customer) and `booking_alert` (business), with dedupe keys `booking_received:<id>` and `booking_alert:<id>`.
  - Respond 201 `{ bookingId, type, amount, quoteRequired, advanceAllowed, advanceAmount, emailQueued }`. Return 503 when `getAdmin()` is null (do **not** fall back to email-only).
- [ ] T020 [US1] Delete `adventure-travel/api/course-bookings.js`. Confirm with `grep -rn "course-bookings" adventure-travel/src` that nothing still calls it.
- [ ] T021 [US1] In `adventure-travel/src/lib/auth.ts`, rewrite `createTrekBooking(input: { trekSlug; date; groupSize; roomSharing?; message })` to POST `/api/bookings` with `Authorization: Bearer <session access token>`. Return the response JSON, and throw `BackendUnavailableError` on 503 or a network failure. Remove the client-side `trackActivity("BOOKING_CREATED")` call (the server logs it now).
- [ ] T022 [US1] Update `handleBookingSubmit` in `adventure-travel/src/app/treks/[id]/TrekDetailClient.tsx`:
  - Call the new `createTrekBooking` with the selected room tier (`bookingForm` / room-sharing state already in the file).
  - Store `bookingId` for the existing "Pay online with UPI" link.
  - On `BackendUnavailableError`, render `<WhatsAppFallback>` with the booking details instead of a success state.
  - Keep the existing WhatsApp hand-off message.
- [ ] T023 [US1] Update `handleBook` in `adventure-travel/src/app/courses/[course]/CourseDetailClient.tsx` to POST `/api/bookings` with `{ type: "course", slug: course.slug, tierId, stay, date, groupSize: Number(...), contact: { name, email, phone }, message }`. Keep the existing bearer-token attachment and the `saved` / pay-link behaviour. Map a 503 to the existing WhatsApp fallback banner.
- [ ] T024 [P] [US1] Add a "Request this activity" form to `adventure-travel/src/app/activities/ActivitiesPageClient.tsx`:
  - Fields: activity, preferred date, group size, message.
  - It calls the existing `createActivityBooking` in `adventure-travel/src/lib/auth.ts` (Supabase insert under RLS).
  - Signed-out users are sent to `/login`. No price and no pay button (FR-013).
  - On `BackendUnavailableError`, show `<WhatsAppFallback>`.
- [ ] T025 [US1] Run quickstart **V1–V5, V18 and V22** against the dev Supabase project with `npx vercel dev`. If V3 shows a duplicate user for an unverified password account plus Google, add a check in `adventure-travel/src/lib/auth.ts` `signInWithGoogle` flow per research R9. Record pass/fail in a new "Results" section at the end of `specs/001-persistent-backend/quickstart.md`.

**Checkpoint**: The MVP. Data persists across devices with locked prices. This can ship on its own.

---

## Phase 4: User Story 2 - The business sees and manages every booking (Priority: P2)

**Goal**: An admin area to list, search, filter and change every booking, customer and payment, with an audit trail.

**Independent Test**: quickstart **V12, V13, V16**.

- [ ] T026 [P] [US2] Create `adventure-travel/src/lib/admin.ts` (browser Supabase client, RLS-enforced) exporting:
  - `listBookings({ type?: "trek"|"course"|"activity"; status?; paymentState?; from?; to?; q?; overdueOnly? })`. Searches `ilike` on contact name, email or phone and on the booking id prefix. Overdue means `payment_state === "advance_paid"` and `balance_due_date` < today in IST.
  - `updateBookingStatus(type, id, status)`
  - `recordRefund(type, id)`, which sets `payment_state: "refunded"`
  - `listCustomers(q?)`
  - `getCustomer(id)`, which returns the profile plus all bookings plus payments
  - `listPayments(filters)`
  - `listFailedNotifications()`
  - `getBookingEvents(type, id)`
- [ ] T027 [US2] Create `adventure-travel/src/components/admin/AdminGate.tsx`. It wraps children in `ThemeScope`, redirects signed-out users to `/login`, and shows "Admin access required" unless `user.app_metadata?.role === "admin"`. Refactor `adventure-travel/src/app/admin/activity/AdminActivityClient.tsx` to use it.
- [ ] T028 [P] [US2] Create `adventure-travel/src/components/admin/AdminNav.tsx`, with tabs Activity, Bookings, Customers and Payments linking to `/admin/activity`, `/admin/bookings`, `/admin/customers` and `/admin/payments`. Render it inside `AdminGate`.
- [ ] T029 [P] [US2] Create `adventure-travel/src/app/admin/bookings/page.tsx` (server component: `metadata.robots = { index: false, follow: false }`) and `adventure-travel/src/app/admin/bookings/BookingsAdminClient.tsx`. The client has:
  - a search box and filters (type, status, payment state, date range, "overdue only")
  - a table: reference, customer, item, start date, group size, amount, paid, payment state, an overdue badge and status
  - a status `<select>` calling `updateBookingStatus`
  - a "Record refund" action with a confirm step
  - a drawer listing `getBookingEvents`
- [ ] T030 [P] [US2] Create `adventure-travel/src/app/admin/customers/page.tsx` and `adventure-travel/src/app/admin/customers/CustomersAdminClient.tsx`. A searchable customer list; selecting one shows the profile (including emergency contact), bookings and payments from `getCustomer`.
- [ ] T031 [P] [US2] Create `adventure-travel/src/app/admin/payments/page.tsx` and `adventure-travel/src/app/admin/payments/PaymentsAdminClient.tsx`. A payments table (date, customer, booking, kind, amount, method, status) and a "Failed emails" panel from `listFailedNotifications`.
- [ ] T032 [US2] Add `"ADMIN_STATUS_CHANGE"` and `"COURSE_BOOKING_CREATED"` to `ActivityAction` in `adventure-travel/src/lib/activity.ts`, and to the `ACTIONS` map in `adventure-travel/src/components/admin/ActivityFeed.tsx`. Labels are "Status change" (tone `slate`, describes "changed a booking from X to Y") and "Course booking" (tone `slate`).
- [ ] T033 [US2] Run quickstart **V12, V13 and V16** and record the results in `specs/001-persistent-backend/quickstart.md`.

**Checkpoint**: The business can act on every stored booking.

---

## Phase 5: User Story 3 - Pay online and see payment history (Priority: P3)

**Goal**: Pay a 30% advance or the full amount, pay the balance later, with exactly-once payment application.

**Independent Test**: quickstart **V6, V7, V8, V9, V10, V17**.

- [ ] T034 [US3] Rewrite `adventure-travel/api/create-order.js` to the contract in `specs/001-persistent-backend/contracts/http-api.md`. The body is `{ bookingType: "trek"|"course", bookingId, kind: "advance"|"balance"|"full" }`.
  - Load the booking with the service role and require ownership. Keep the existing verified-email claim for signed-out course bookings.
  - Return **409** if the booking is `cancelled`, or `payment_state` is `fully_paid` or `refunded`. Return **422** if `quote_required`.
  - Compute the order amount from the booking's **stored** `amount` (never the catalog):
    - `advance`: `pricing.advanceAmount(amount)`. Only when `pricing.isAdvanceAllowed(startDate, amount_paid)`; otherwise 400.
    - `balance`: `amount - amount_paid`. Only when `payment_state === "advance_paid"`; otherwise 400.
    - `full`: `amount - amount_paid`. Only when `payment_state === "unpaid"`; otherwise 400.
  - Reuse an unpaid `payments` row with the same booking, `kind` and amount. Otherwise create the Razorpay order and insert `payments` with `kind`.
  - Log `PAYMENT_INITIATED`.
  - Respond with `summary: { total, paid, dueAfterThis, balanceDueDate }`.
- [ ] T035 [US3] Update `adventure-travel/api/verify-payment.js` to call `payments.applyPayment(db, { orderId, paymentId })`, passing `amount` from the stored payments row. Respond `{ status: "paid", paymentState, bookingStatus }`. Treat `already` as success, and `unknown_order`/`amount_mismatch` as 409.
- [ ] T036 [US3] Update `adventure-travel/api/razorpay-webhook.js`. For `payment.captured`/`order.paid`, call `payments.applyPayment(db, { orderId: payment.order_id, paymentId: payment.id, amount: payment.amount, method: payment.method })`. Keep `markFailed` for `payment.failed`, and keep the raw-body signature check unchanged.
- [ ] T037 [P] [US3] Create `adventure-travel/src/components/PaymentChoice.tsx`. Props `{ total: number; advance: number; advanceAllowed: boolean; balanceDueDate: string | null; value: "advance"|"full"; onChange }`. Two radio cards:
  - "Pay 30% advance": Rs.X now, Rs.Y due by <date>, with "The advance is non-refundable" and a link to `/cancellation-policy`.
  - "Pay in full": Rs.total.
  
  When `!advanceAllowed`, disable the advance card with the text "Your trek starts within 15 days, so full payment is needed." Use `formatPaise` from `adventure-travel/src/lib/utils.ts`. Always show INR.
- [ ] T038 [US3] Update `adventure-travel/src/app/checkout/CheckoutClient.tsx`:
  - Read `amount`, `amount_paid`, `payment_state`, `quote_required` and the start date from the booking row.
  - When `unpaid`, render `<PaymentChoice>`. When `advance_paid`, show "Pay balance Rs.Y (due <date>)".
  - Honour the `?kind=balance` query param (from reminder emails).
  - POST `{ bookingType, bookingId, kind }` to `/api/create-order`.
  - Poll `payment_state` (not just `payments.status`) while confirming.
  - Success copy distinguishes "Advance received, balance Rs.Y due <date>" from "Paid in full".
  - Keep the INR notice and `Price` behaviour.
- [ ] T039 [US3] Update `adventure-travel/src/app/dashboard/page.tsx`. For each trek and course booking, show Total, Paid, Balance + due date, and an "Overdue" tag (derived in IST).
  - Buttons: "Pay now" (`unpaid` and not `quote_required`, links to `/checkout?booking=<id>` or `?course=<id>`) and "Pay balance" (`advance_paid`, appends `&kind=balance`).
  - "Quote requested" text when `quote_required`.
  - Add a `kind` column to the payments list.
- [ ] T040 [US3] In `adventure-travel/src/lib/auth.ts`, add `kind: "advance"|"balance"|"full"` to `PaymentRecord` and select `kind` in `getPayments`.
- [ ] T041 [US3] Run quickstart **V6–V10 and V17** in Razorpay **test mode**, and record the results in `specs/001-persistent-backend/quickstart.md`.

**Checkpoint**: Advance/full/balance payments work, and the webhook and browser can't double-apply.

---

## Phase 6: User Story 4 - Confirmations reach the customer and the business (Priority: P4)

**Goal**: Reliable booking, payment and reminder emails that never block or lose records.

**Independent Test**: quickstart **V14, V15**.

- [ ] T042 [US4] Create `adventure-travel/api/cron.js` implementing `GET /api/cron` per `specs/001-persistent-backend/contracts/http-api.md`:
  - Require `req.headers.authorization === "Bearer " + process.env.CRON_SECRET` (401 otherwise, including when `CRON_SECRET` is unset).
  - Using `pricing.istDate()`:
    1. Queue `balance_reminder_7d` for `advance_paid` bookings with `balance_due_date = today + 7`.
    2. Queue `balance_reminder_due` for `balance_due_date = today` (dedupe keys `balance_reminder_7d:<booking_id>` and `balance_reminder_due:<booking_id>`), with a "Pay balance" link `https://www.himalayanarcadventure.com/checkout?booking=<id>&kind=balance` (or `course=`).
    3. Retry `notifications` with `status = 'failed' and attempts < 3` via `notify.sendOne`.
    4. Count overdue bookings.
  - Respond `{ reminders, retried, overdue }`.
- [ ] T043 [US4] Confirm the immediate-send paths: `adventure-travel/api/bookings.js` (T019) and `adventure-travel/api/_lib/payments.js` (T014) must call `notify.enqueueAndSend` **after** the database write commits, and must never return an error to the customer because of email. Add a code comment at each call site citing FR-032.
- [ ] T044 [US4] Configure Supabase Auth for production email, following quickstart §2.2. In `specs/001-persistent-backend/quickstart.md` "Results", record that custom SMTP is set, Confirm email is on, and the redirect URLs include `/dashboard` and `/reset-password`. This is a manual dashboard step with no code.
- [ ] T045 [US4] Run quickstart **V14 and V15** (call the cron with `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron` under `npx vercel dev`), and record the results in `specs/001-persistent-backend/quickstart.md`.

**Checkpoint**: Emails are reliable, retried and de-duplicated.

---

## Phase 7: User Story 5 - Manage my profile and cancel a pending booking (Priority: P5)

**Goal**: Self-service profile, cancellation, password reset and account deletion.

**Independent Test**: quickstart **V20, V21**, plus editing the profile on browser A and seeing it on browser B.

- [ ] T046 [US5] In `adventure-travel/src/app/dashboard/page.tsx`:
  - Show "Cancel" only for bookings with `status === "pending"` and `payment_state === "unpaid"` (trek **and** course).
  - Add `cancelCourseBooking(id)` beside `cancelTrekBooking` in `adventure-travel/src/lib/auth.ts`.
  - For confirmed or paid bookings, show "Need to cancel? See our cancellation policy" linking to `/cancellation-policy` and WhatsApp.
- [ ] T047 [P] [US5] Show a dismissible banner in `adventure-travel/src/app/dashboard/page.tsx` when the profile has no `emergency_contact_name` and the customer has a confirmed booking starting in the next 30 days: "Add an emergency contact before your trek". It opens the existing profile editor.
- [ ] T048 [P] [US5] Add a "Forgot password?" link to `adventure-travel/src/app/login/page.tsx`. It calls a new `requestPasswordReset(email)` in `adventure-travel/src/lib/auth.ts` (`supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + "/reset-password" })`) and always shows "If that email has an account, a reset link is on its way."
- [ ] T049 [P] [US5] Create `adventure-travel/src/app/reset-password/page.tsx` (`"use client"`, matching the dark style of `/login`):
  - Wait for the Supabase recovery session (`onAuthStateChange` event `PASSWORD_RECOVERY`, or an existing session).
  - Show new-password and confirm fields (at least 8 characters, must match).
  - Call a new `updatePassword(pw)` in `adventure-travel/src/lib/auth.ts` (`supabase.auth.updateUser({ password })`), then redirect to `/dashboard`.
  - Add `/reset-password` to the `disallow` list in `adventure-travel/src/app/robots.ts`.
- [ ] T050 [US5] Create `adventure-travel/api/account.js` handling `POST { action }` per `specs/001-persistent-backend/contracts/http-api.md`. Implement `delete` now (requires `confirm: "DELETE"`), with the service role:
  1. Set the profile's `full_name = ''`, `phone = ''`, `city = ''`, emergency contact fields to `''`, `email = null` and `deleted_at = now()`.
  2. Set `contact_name = 'Deleted user'`, `contact_email = ''` and `contact_phone = ''` on their course bookings.
  3. `db.auth.admin.deleteUser(user.id)`. The FKs from T006 keep the bookings and payments with `user_id = null`.
  
  Respond `{ deleted: true }`. Return 400 for an unknown action.
- [ ] T051 [US5] Add a "Delete my account" section at the bottom of `adventure-travel/src/app/dashboard/page.tsx`. It explains that payment records are kept for legal reasons, requires typing `DELETE`, calls `deleteAccount()` (new in `adventure-travel/src/lib/auth.ts`, which POSTs `/api/account { action: "delete", confirm: "DELETE" }`), then signs out and redirects to `/`.
- [ ] T052 [US5] Run quickstart **V20 and V21** and record the results in `specs/001-persistent-backend/quickstart.md`.

**Checkpoint**: Customers can manage themselves without contacting the business.

---

## Phase 8: User Story 6 - A booking made before signing in joins my account (Priority: P6)

**Goal**: Course bookings made while signed out attach to the account that signs in with the same verified email.

**Independent Test**: quickstart **V11**.

- [ ] T053 [US6] Add `action: "claim"` to `adventure-travel/api/account.js`. Move the logic from `adventure-travel/api/claim-bookings.js`: a verified email only (`user.email_confirmed_at`), with `.eq("contact_email", user.email.toLowerCase()).is("user_id", null)`, never `ilike`. Respond `{ claimed }`.
- [ ] T054 [US6] Delete `adventure-travel/api/claim-bookings.js`. Change both callers, `adventure-travel/src/app/dashboard/page.tsx` and `adventure-travel/src/app/checkout/CheckoutClient.tsx`, to `POST /api/account` with body `{ "action": "claim" }`.
- [ ] T055 [US6] Run quickstart **V11** and record the result in `specs/001-persistent-backend/quickstart.md`.

**Checkpoint**: No orphaned course bookings.

---

## Phase 9: User Story 7 - Customers from the old browser-only mode are not stranded (Priority: P7)

**Goal**: A one-time notice, then the old browser-only data is wiped.

**Independent Test**: quickstart **V19**.

- [ ] T056 [US7] Create `adventure-travel/src/components/LegacyDataNotice.tsx` (`"use client"`).
  - On mount, inside a `try`/`catch`, check `localStorage` for any of `eht_users`, `eht_session`, `eht_bookings`, `eht_trek_bookings` or `eht_activity_bookings` (`eht_bookings` came from the deleted `src/lib/auth-store.ts`).
  - If one is present, **remove all five keys immediately** (FR-051) and show a dismissible modal: "We've upgraded accounts. Please sign up again to keep your bookings safe across devices. Booked with us before? Message us on WhatsApp and we'll sort it out." Buttons: "Sign up" (`/signup`), "WhatsApp" (`https://wa.me/917817912062`) and "Close".
  - Respect reduced motion.
  - Mount it in `adventure-travel/src/app/layout.tsx` next to `<WelcomeChooser />`. If both would show, the notice takes priority: render `WelcomeChooser` only when no legacy keys were found, using a small shared flag in `sessionStorage` under `hac_legacy_checked`.
- [ ] T057 [US7] Run quickstart **V19** and record the result in `specs/001-persistent-backend/quickstart.md`.

**Checkpoint**: All seven stories done.

---

## Phase 10: Polish & Cross-Cutting Concerns

- [ ] T058 [P] Align the payment-terms copy with FR-020 in `adventure-travel/src/app/treks/[id]/TrekDetailClient.tsx`, `adventure-travel/src/components/TermsConditions.tsx` and `adventure-travel/src/app/cancellation-policy/CancellationPolicyPageClient.tsx`, so the site no longer contradicts itself:
  - In `adventure-travel/src/app/treks/[id]/TrekDetailClient.tsx`, change "Book by paying only 30% advance" to "Pay 30% advance or in full".
  - In the Payments tab of `adventure-travel/src/components/TermsConditions.tsx`, replace "Full amount to be paid to confirm booking" with "Pay a 30% advance (non-refundable) or the full amount online. The balance is due 15 days before departure."
  - Check `adventure-travel/src/app/cancellation-policy/CancellationPolicyPageClient.tsx` for the same terms.
- [ ] T059 [P] Update `adventure-travel/.env.example` and `CLAUDE.md` (repo root):
  - Document that `api/bookings`, `api/account` and `api/cron` replaced `course-bookings` and `claim-bookings`.
  - List the five SQL files in run order.
  - Note that `npm test` now exists (Vitest, `api/_lib` only).
- [ ] T060 Run `npm run catalog`, `npx tsc --noEmit`, `npm run lint` and `npm test` in `adventure-travel/`. Then, **only after confirming that no dev server is running on :3000**, run `npm run build`. Fix any failures.
- [ ] T061 Run the full quickstart **V1–V22** end to end on a Vercel preview deployment connected to the dev Supabase project and Razorpay test mode, and record every result in `specs/001-persistent-backend/quickstart.md`.
- [ ] T062 Walk through the go-live checklist in `specs/001-persistent-backend/quickstart.md` §5 with the business owner: live keys, production migrations, env vars, international payments decision, and a ₹1 live test plus refund.

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: none. T001 must pass before anything else.
- **Foundational (Phase 2)**: depends on Setup and **blocks every story**. Within it, T005–T009 are the same SQL file and must run in order. T010–T013 and T015 can run in parallel. T014 depends on T012. T016–T018 can run in parallel with the SQL work.
- **User stories (Phases 3–9)**: each depends only on Foundational, plus the cross-story notes below.
- **Polish (Phase 10)**: after the stories you intend to ship.

### User story dependencies

| Story | Depends on | Notes |
|---|---|---|
| US1 (P1) | Foundational | MVP |
| US2 (P2) | Foundational | Works with data from any source; better demoed after US1 |
| US3 (P3) | Foundational | Needs priced bookings, so in practice it follows US1 (T019) |
| US4 (P4) | Foundational | T043 checks the call sites created in T019 and T014 |
| US5 (P5) | Foundational | T050 creates `api/account.js`; US6 extends it |
| US6 (P6) | **US5 (T050)** | Adds `claim` to the same file |
| US7 (P7) | Foundational | Fully independent |

### Same-file sequencing (avoid parallel edits)

| File | Tasks |
|---|---|
| `adventure-travel/src/lib/auth.ts` | T016 → T021 → T040 → T046 → T048 → T049 → T051 |
| `adventure-travel/src/app/dashboard/page.tsx` | T039 → T046 → T047 → T051 → T054 |
| `adventure-travel/src/app/checkout/CheckoutClient.tsx` | T038 → T054 |
| `adventure-travel/api/account.js` | T050 → T053 |
| `adventure-travel/src/app/treks/[id]/TrekDetailClient.tsx` | T022 → T058 |

---

## Parallel Examples

```bash
# Foundational: after T005–T009 (one SQL file, sequential)
Task: "T010 pricing.js"      Task: "T011 pricing.test.js"
Task: "T012 notify.js"       Task: "T013 notify.test.js"
Task: "T015 payments.test.js"  Task: "T017 next.config.ts guard"  Task: "T018 WhatsAppFallback.tsx"

# US2: once T026 (admin.ts) and T027 (AdminGate) exist
Task: "T029 admin/bookings"  Task: "T030 admin/customers"  Task: "T031 admin/payments"  Task: "T028 AdminNav"

# US5: independent screens
Task: "T048 Forgot password link"  Task: "T049 /reset-password page"  Task: "T047 emergency-contact banner"
```

---

## Implementation Strategy

### MVP first (User Story 1 only)

1. Phase 1 Setup, then Phase 2 Foundational. Run the migration on the **dev** Supabase project.
2. Phase 3 (US1). **Stop and validate** with quickstart V1–V5, V18 and V22.
3. Deploy. From this point customer data stops being lost, which is the biggest single win.

### Incremental delivery

US1 → US2 (the business can act) → US3 (revenue online) → US4 (trust and reminders) → US5 → US6 → US7. Each is a separate deploy, and each keeps the previous ones working.

### Suggested commit points

Commit after each checkpoint. Use Conventional Commit style, like the existing history (`feat: …`, `fix: …`), ending with the repo's Co-Authored-By line.

---

## Notes

- Constraint values in tasks are quoted verbatim from `specs/001-persistent-backend/data-model.md`. If a task and the data model disagree, the data model wins; fix the task.
- Function count after all tasks: `bookings`, `create-order`, `verify-payment`, `razorpay-webhook`, `account`, `cron`, `geo` and `rates` = **8** (research R3).
- Out of scope (spec Assumptions): granular staff roles, automated refunds, scholarship automation, and charging in non-INR currencies.
