# Goldfish Review Report

**Target:** `specs/003-coupons/design.md` (lines 1-146)

Code paths below are relative to `adventure-travel/`.

## Reviewer Status

| Reviewer | Status |
| --- | --- |
| `egm-design` | completed |
| `egm-codebase-details` | completed |
| `egm-zoom-out` | completed |
| `egm-implementation-readiness` | completed |
| `egm-inventive-catalyst` | completed |

**Severity breakdown:** 2 Blockers, 11 Major, 16 Nits.

## What the reviewers confirmed

All five reviewers agree that the core decision is right and is the simplest safe choice: apply the discount once, at booking creation, and store the result as the locked `amount`.

- **Payment code needs no changes.** Everything downstream reads only the stored `amount`:
  - `orderAmount()` (`api/_lib/pricing.js:96-119`)
  - `create-order.js:57,76,111-113`
  - `apply_payment()` (`supabase-payments-v2.sql:313-351`)
  - `cron.js:57`
  - `CheckoutClient.tsx:110,126`
  - `paymentRules.ts`

  The legacy re-pricing code (`create-order.js:57-66`, `CheckoutClient.tsx:119`) runs only when `amount` is null, so coupon bookings never reach it.
- **Rounding is safe.** Catalog list prices are always whole rupees (`pricing.js:23,34`). Rounding the discount down to a whole rupee keeps `amount` whole, and `advanceAmount()` rounds up (`pricing.js:38-40`). The §3.4 example (1250000 / 125000 / 1125000 / 337500) checks out.
- **The function count is right.** `api/` has exactly 8 functions (`account`, `bookings`, `create-order`, `cron`, `geo`, `rates`, `razorpay-webhook`, `verify-payment`), so putting preview in `bookings.js` instead of a new function is correct. Note that 8 is the project's own cap; Vercel Hobby allows 12 (CLAUDE.md:77).
- **The helpers the design names exist.** `istDate()` (`pricing.js:47`), `is_admin()` (`supabase-activity-payments.sql:15`), status values `pending|confirmed|cancelled` (`supabase-backend.sql:83`), and setup-script `--dry-run` with its file list (`scripts/setup-backend.mjs:10,19-27`).
- **The alternatives were rightly rejected.** Razorpay Offers, hard-coded codes and a discount at create-order were all correctly ruled out in §4.

## Prioritized Findings (Blockers -> Major -> Nits)

### 1. The first-booking rule can't be built as written, and anyone can get round it for free - Severity: Blocker
* **Reviewer Lens:** `egm-implementation-readiness` (Blocker), `egm-design`, `egm-codebase-details`, `egm-zoom-out`, `egm-inventive-catalyst` (Major)
* **Affected Scope:** §2 goal line 21; §3.3 rule 5 lines 84-86; §7 Q1, Q3, Q4
* **Discrepancy Description**:
  - **The rule references a column that doesn't exist.** Rule 5 matches earlier bookings by `user_id` OR `lower(contact_email)` across both tables, but `trek_bookings` has no `contact_email` column (`supabase-schema.sql:33-43`; `createTrek` writes only `user_id`, `api/bookings.js:46-58`).
  - **Deleting the account resets eligibility.** `api/account.js:38-44` blanks `course_bookings.contact_email` and deletes the auth user. The foreign keys then set `user_id` to null (`supabase-payments-v2.sql:78-80`). After "delete account, sign up again with the same email", the customer is a first-timer again.
  - **Gmail aliases and throwaway inboxes each count as a new verified email.** `name+1@gmail.com`, dotted variants and Google sign-in (`auth.ts:59`) all pass. Requiring email confirmation (`setup-backend.mjs:151`) doesn't stop this.
  - **The discount has no ceiling.** `max_discount` is nullable, groups go up to 10 people (`pricing.js:8`), and the percentage applies to the whole group (Q4). One alias can therefore take 20% off a ₹1-2 lakh booking.
  - **The goal overstates the check.** "Can't be reused by the same account" reads as a guarantee the design doesn't provide.
* **Rationale & Recommendation**:
  - **Write the threat model down.** State that "first booking" is per account and best effort, and that the admin list's `coupon_code` column is the safety net.
  - **Cap first-booking codes.** Make a cap mandatory: `check (first_booking_only = false or max_discount is not null)`. This turns abuse into a known, bounded cost and answers Q1.
  - **Spell out the queries per table:**
    - treks: `user_id = :uid`
    - courses: `user_id = :uid or contact_email = :email` (already stored in lower case, `bookings.js:92`)

    Alternatively, attach the user's signed-out course bookings first by moving `account.js` `claim()` (lines 9-19) into `api/_lib/`. Then a single `user_id` check is enough.
  - **Optional cheap hardening:**
    - Normalise emails before matching: lower-case, strip `+tag`, and drop the dots for gmail.com.
    - Treat a matching phone number as a soft signal that flags the booking for the owner but doesn't block it.
    - Keep a hashed record of used first-booking codes that account deletion doesn't wipe. If you do, mention it in the deletion/privacy notes (FR-070).
  - **Add an owner question next to Q3:** how much abuse is acceptable?

### 2. Preview can't run "the exact same path" as create, and the UX in §3.5 fails for signed-out visitors - Severity: Blocker
* **Reviewer Lens:** `egm-implementation-readiness` (Blocker), `egm-design`, `egm-codebase-details`, `egm-inventive-catalyst`, `egm-zoom-out` (Major)
* **Affected Scope:** §3.4 lines 94-102; §3.5 line 106; §5 lines 128-129
* **Discrepancy Description**: The existing code stops a preview before the price is ever computed:
  - **Signed-out trek visitors get a 401.** `createTrek` throws 401 "Please sign in to book a trek." before any pricing (`bookings.js:28`). The trek form is shown to signed-out visitors (`TrekDetailClient.tsx:176-186`), so "Apply" fails for exactly the people the "First trek with us?" promotion targets.
  - **Course preview needs the whole contact form.** `createCourse` validates name, email and phone before pricing (`bookings.js:95-97`).
  - **Preview hits seat and date checks.** Both functions run the seat lookup and date check (`bookings.js:37-38`), so a preview can fail with a 409 and touches the database on every group-size change.
  - **There is no place to return early.** The insert sits inside the pricing functions (`bookings.js:44-61, 102-124`), and the handler then always logs activity and queues two emails (`bookings.js:160-193`). A `preview` flag threaded through this code risks a real booking or email being created by a preview.
  - **The E2E plan can't run as described.** §5 line 129 can't preview a trek without a signed-in test user.
* **Rationale & Recommendation**:
  - **Split the code in two:**
    - `quote(db, user, body)`: validate and price, with no writes. It returns `{listAmount, discount, amount, coupon, advanceAmount, advanceAllowed, row}`.
    - `persist(row)`, followed by the activity log and notify.

    Preview calls only `quote`; create calls both. "Can't disagree" then holds by construction.
  - **Spell out the preview contract:**
    - which checks preview skips (auth? contact details? seats? date?)
    - status 200 rather than 201
    - `advanceAmount: null` when the start is 15 days away or less (`bookings.js:170-171`, `pricing.js:79-81`)
    - what a signed-out trek visitor sees: hide the field, or show "Sign in to use a code"
  - **Keep the code through sign-up.** Persist the code in the sessionStorage draft (`DRAFT_KEY`, `TrekDetailClient.tsx:180`) so it survives the signup redirect.
  - **A simpler option (`egm-zoom-out`):** drop preview from v1. Creating a booking takes no money, `/checkout` already shows the locked total before payment, and pending unpaid bookings can be cancelled (`supabase-payments-v2.sql:92-102`). Extend the 201 response with `listAmount` and `discount`, and add preview later only if customers abandon at checkout. `egm-implementation-readiness` prefers keeping preview but fully specified. **This is an owner/author decision.**

### 3. Abandoned unpaid bookings count as redemptions forever; anonymous course bookings can use up capped codes and block first-timers - Severity: Major
* **Reviewer Lens:** all five
* **Affected Scope:** §3.2 line 75; §3.3 rules 4-5 lines 83-86
* **Discrepancy Description**: A redemption is any booking with `status <> 'cancelled'`, and nothing ever cancels a stale `pending`/`unpaid` booking: `cron.js` only sends reminders, retries emails and counts overdue bookings (`cron.js:26-101`). As a result:
  - **Abandoned bookings use up codes.** An abandoned booking holds a `max_redemptions` slot forever.
  - **Anyone can exhaust a capped code for free.** Course bookings need no sign-in and have no rate limit (`bookings.js:76-107`). Anyone can POST unpaid course bookings with a partner code until the cap is used up. Each one also sends two emails.
  - **Honest first-timers are refused.** A visitor who once started a booking without the code is refused WELCOME10 later ("for your first booking only"), even though they never paid.
* **Rationale & Recommendation**:
  - **First booking:** a previous booking counts only if it has `amount_paid > 0`, or if it is non-cancelled and itself used a first-booking code. That keeps the "one open WELCOME booking" guard without penalising abandoned carts.
  - **Caps:** count only paid bookings, accepting a small overshoot, or count unpaid ones only for N hours, like the seat holds (`departures.holdSeats`, `create-order.js:119-123`).
  - **Or simplest:** drop `max_redemptions` from v1 (`egm-zoom-out`). The owner can stop a code with `active = false` or `valid_until`.

### 4. The proposed fix for the race can't be built; the `max_redemptions` race isn't mentioned - Severity: Major
* **Reviewer Lens:** `egm-design`, `egm-codebase-details`, `egm-zoom-out`, `egm-implementation-readiness`, `egm-inventive-catalyst`
* **Affected Scope:** §3.3 line 90
* **Discrepancy Description**:
  - **The index is impossible.** A Postgres partial-index predicate can't read `coupons.first_booking_only` from another table, and one index can't cover both `trek_bookings` and `course_bookings`.
  - **There is a second race.** `max_redemptions` is a count followed by an insert across two PostgREST calls, so concurrent bookings can go over the cap.
* **Rationale & Recommendation**: Either:
  - delete the index sentence and accept both races in writing, which is fine at this volume; or
  - name a real mechanism: a `coupon_redemptions` ledger, filled by an AFTER INSERT trigger on both booking tables or by a SECURITY DEFINER RPC that locks the coupon row with `select ... for update`, with partial unique indexes on `(user_id) where first_booking`. The unique-violation error must then map to the friendly 400 message.

### 5. Placing the migration after `supabase-scale.sql` and replacing `guard_booking_money()` undoes existing hardening - Severity: Major
* **Reviewer Lens:** `egm-codebase-details` (Blocker), `egm-implementation-readiness` (Major), `egm-zoom-out` (Nit)
* **Affected Scope:** §3.2 line 47 ("Runs after supabase-scale.sql"), line 74
* **Discrepancy Description**: `supabase-scale.sql` is meant to run last (CLAUDE.md:83). It wraps every policy's `auth.uid()`/`is_admin()` (lines 31-53), sets `guard_booking_money()` `search_path = ''` (line 58), and grants the API roles (line 61). Running `supabase-coupons.sql` after it causes three problems:
  - **The search_path fix is lost.** A `create or replace function` resets that setting.
  - **New policies stay unwrapped.**
  - **The coupon guard is fragile on re-runs.** `supabase-payments-v2.sql:140` re-creates the old guard on every run, so the coupon columns are protected only as long as coupons.sql stays after it.

  The guard is also BEFORE UPDATE only. Inserts are blocked because the browser has no insert policy (`supabase-payments-v2.sql:89`; `supabase-backend.sql:66-67`), not by the trigger. The design should say so.
* **Rationale & Recommendation**:
  - **Fix the order.** Put `supabase-coupons.sql` before `supabase-scale.sql` in `SQL_FILES` (`scripts/setup-backend.mjs:19-27`) and in CLAUDE.md. Or extend the guard in place in `supabase-payments-v2.sql`.
  - **Write out the full new guard body.** Add `new.coupon_code / list_amount / discount is distinct from old.*` to the condition at `payments-v2.sql:149-152`, with schema-qualified names and `set search_path = ''`.
  - **Reload the schema.** Add `notify pgrst, 'reload schema';`.

### 6. The coupons grants and the admin policy contradict each other and the project rule - Severity: Major
* **Reviewer Lens:** `egm-codebase-details` (Blocker), `egm-implementation-readiness` (Major), `egm-design`, `egm-zoom-out`, `egm-inventive-catalyst` (Nit)
* **Affected Scope:** §3.2 lines 63-65
* **Discrepancy Description**:
  - **The policy can never apply.** Only `service_role` gets a grant, but the comment says admins read through an `is_admin()` policy. Admins use the `authenticated` role, so without a grant Postgres refuses the query before RLS runs. The policy isn't written either.
  - **The project rule says otherwise.** CLAUDE.md:84 requires `grant … to anon, authenticated, service_role`, with RLS deciding access.
  - **Re-runs change the grants anyway.** Depending on file order, `supabase-scale.sql:61` will grant `anon`/`authenticated` on re-runs regardless of what this file grants.
* **Rationale & Recommendation**: Follow the project pattern: grant to all three roles, enable RLS, and either write the admin select policy as `(select public.is_admin())` or drop the sentence. v1 uses the table editor, which bypasses RLS, so the policy isn't needed yet.

### 7. Error messages reveal which codes exist, and partner codes will leak - Severity: Major
* **Reviewer Lens:** `egm-design`, `egm-codebase-details` (Major), `egm-implementation-readiness` (Nit)
* **Affected Scope:** §3.3 line 92; §3.4; §1 goal 2
* **Discrepancy Description**:
  - **The messages confirm a code exists.** Specific messages ("This code has expired.", "This code is for treks only.") tell the caller the code is real.
  - **Guessing is cheap.** Course preview needs no session, there is no rate limiting (static export, no middleware), and codes like `TRAVELPORTAL20` are guessable.
  - **Leaks spoil the point of partner codes.** Coupon aggregator sites will republish codes. Once that happens, the channel attribution (goal 2) is meaningless and the discount is open to everyone.
* **Rationale & Recommendation**:
  - Return one generic message for unknown, inactive or out-of-window codes. Keep specific messages only for rules that apply to a valid code (first booking only, treks only).
  - Advise non-guessable partner codes, with a `valid_until` on each.
  - Optionally log failed attempts with `clientIp` (`api/_lib/supabaseAdmin.js:24`).

### 8. A refund doesn't free the code, and a cancellation without a refund does (contradicts Q6) - Severity: Major
* **Reviewer Lens:** `egm-codebase-details` (Major), `egm-inventive-catalyst`, `egm-implementation-readiness` (Nit)
* **Affected Scope:** §3.2 line 75; §7 Q6 line 145
* **Discrepancy Description**:
  - **A refund leaves the code used.** Recording a refund sets only `payment_state = 'refunded'` (`src/lib/admin.ts:248`; guard at `supabase-payments-v2.sql:156-157`), and the status stays `confirmed`, so the code stays used.
  - **A cancellation frees it even when money is kept.** An admin can cancel a paid booking without refunding it (`admin.ts:241`), and that frees the first-booking use while the money is kept.
  - **The wording doesn't match the rule.** "A cancelled, unpaid booking frees its use" isn't what the rule as written does.
* **Rationale & Recommendation**: Define a redemption exactly, for example `status <> 'cancelled' and payment_state <> 'refunded'`, or state that the admin must both cancel and refund. Then make Q6 match.

### 9. The rollout gate is undefined, and deploy order can break every booking - Severity: Major
* **Reviewer Lens:** `egm-codebase-details`, `egm-implementation-readiness` (Major), `egm-design`, `egm-zoom-out`, `egm-inventive-catalyst` (Nit)
* **Affected Scope:** §6 step 2 line 134; §6 step 1
* **Discrepancy Description**:
  - **The gate has no mechanism.** "The field only renders when the API is configured": a static export has no config endpoint, so this can't be checked at runtime.
  - **Deploy order can break every booking.** `main` deploys automatically. If `bookings.js` always writes `list_amount`, `discount` and `coupon_code` before the owner approves the migration, every insert fails and returns 502 (`bookings.js:204-207`), even with no coupon.
* **Rationale & Recommendation**:
  - Use a build-time `NEXT_PUBLIC_COUPONS_ENABLED` flag (add it to `.env.example` and the CHANGELOG env tracker), or show the field ungated, since an unknown code just fails.
  - Only write the coupon columns when a coupon was applied.
  - State the order: migration live first, then the API deploy.

### 10. Several pieces of the implementation are only described, not specified - Severity: Major
* **Reviewer Lens:** `egm-implementation-readiness`
* **Affected Scope:** §3.1 lines 35-39; §3.2 lines 67-73; §3.3; §6
* **Discrepancy Description**:
  - **`api/_lib/coupons.js` has no interface.** Undefined so far:
    - the lookup and validation signature and its return shape
    - how it reports errors (`HttpError` is private to `bookings.js:12-17`)
    - what an empty `coupon` means
    - the full list of error messages, including "sign in to use this code" and the message for a 10+ quote booking
  - **The constraint isn't written.** "Add a check constraint" (line 73) has no SQL. It must be idempotent (`do $$ … exception when duplicate_object`, as in `supabase-backend.sql:119-122`) and must accept legacy rows where `amount` is null.
  - **`list_amount` is ambiguous.** It's unclear whether it is written on every booking or only on coupon bookings.
  - **There is no file list and no phases.** Implied but unnamed:
    - `api/_lib/coupons.js`, its test file, `supabase-coupons.sql`, `scripts/setup-backend.mjs`, `api/bookings.js`, `api/_lib/notify.js`
    - in `src/lib/auth.ts`: the `TrekBooking`/`CourseBooking` types (lines 99-111, 230-247), `CreatedBooking` (121-129), the `createTrekBooking` input (135-141), and a new `previewBooking()`
    - `CourseDetailClient.tsx` (its own fetch at line 443), `TrekDetailClient.tsx`, `CheckoutClient.tsx`, `src/app/dashboard/page.tsx`, `src/lib/admin.ts`, `src/app/signup/page.tsx`
    - `specs/001-persistent-backend/contracts/http-api.md`
* **Rationale & Recommendation**:
  - Write the exported signatures, for example:
    - `normalizeCode(raw)`
    - `discountFor(coupon, listAmount)`
    - `resolveCoupon(db, {code, type, user, contactEmail})`, which throws `{status, message}`
  - Add an error-message table.
  - Write the constraint, for example `check ((coupon_code is null and discount = 0) or (list_amount is not null and discount > 0 and amount = list_amount - discount))`.
  - Add the file list and phases that each leave the build working: SQL + `coupons.js` + unit tests, then the create path, then preview, then the UI, then emails and admin.

### 11. Scope is larger than a small business needs right now - Severity: Major
* **Reviewer Lens:** `egm-zoom-out` (Major), `egm-design` (Major, as a missing Risks section)
* **Affected Scope:** §3.2 lines 50-62, 68-70; §7 Q1-Q2; whole document
* **Discrepancy Description**:
  - **Columns are built before the owner has answered.** The schema adds `max_discount`, `applies_to`, `valid_from`, `max_redemptions` and `source` before Q1 (cap) and Q2 (courses) are answered.
  - **Two columns are redundant.** `source` repeats what the code name already says, and `list_amount` can always be derived as `amount + discount`.
  - **Every column has a cost.** Each one adds a validation rule, an error message and a test.
  - **Risks are scattered.** Account abuse, redemption exhaustion, code leakage, and the owner editing live money rows in the table editor with no audit trail (no `updated_at`) appear only in passing; there is no Risks & Mitigations section (`feature-spec-standard.md` lines 23-27, 38-39).
* **Rationale & Recommendation**:
  - **Minimal v1 (`egm-zoom-out`):**
    - `coupons(code, percent_off, first_booking_only, active, valid_until, created_at)`
    - `coupon_code` and `discount` on the booking tables
    - add a cap or `applies_to` only if the owner's answers need them

    Note that finding 1 argues for a mandatory `max_discount` on first-booking codes. If you take that, keep `max_discount`.
  - **Add a Risks & Mitigations section** covering findings 1, 3, 7 and table-editor edits. Add `updated_at`, and advise "pause a code, don't edit it".
  - `egm-implementation-readiness` disagrees: it considers the schema a reasonable minimum. **Author decision.**

### 12. A failed booking (from a coupon error) still opens the WhatsApp hand-off - Severity: Major
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** §3.3 line 92; §3.5 line 106
* **Discrepancy Description**: In the trek form, the WhatsApp hand-off opens whatever the API returns (`TrekDetailClient.tsx:201-214`): the `catch` sets `bookingIssue`, then `window.open(wa.me…)` runs anyway. A customer who types an expired code gets an error and also a WhatsApp chat about a booking that was never saved. The WhatsApp text doesn't include the code either.
* **Rationale & Recommendation**: Specify that a 400 coupon rejection keeps the form open, shows the message under the field, and does not start the WhatsApp hand-off. Include the code in the WhatsApp text when the booking succeeds.

### 13. The 8-function limit is described as a platform limit - Severity: Nit
* **Reviewer Lens:** `egm-design`, `egm-codebase-details`
* **Affected Scope:** §3.4 line 96; §4
* **Discrepancy Description**: The design calls 8 functions a hard limit. It is the project's own cap; Vercel Hobby allows 12 (CLAUDE.md:77). A separate `api/coupons.js` is also not listed among the alternatives.
* **Rationale & Recommendation**: Reword to "our own cap of 8 (Hobby allows 12)". Add the rejected `api/coupons.js` option to §4 with its trade-off.

### 14. Other Nits
* **Reviewer Lens:** various, as noted on each item
* **Affected Scope:** as noted on each item
* **Discrepancy Description and Recommendation:**
  - **Rounding (§3.3 line 88; `egm-design`, `egm-codebase-details`, `egm-implementation-readiness`):**
    - The formula rounds twice. Write it as `Math.min(Math.floor(list * pct / 10000) * 100, cap ?? Infinity)`.
    - Add `check (max_discount % 100 = 0)`. A cap with stray paise would break the whole-rupee rule that `advanceAmount()` relies on.
  - **`list_amount` filled only sometimes (§3.2 line 73; `egm-design`):** Always write `list_amount = amount, discount = 0` on priced bookings, or drop the column (finding 11).
  - **Input normalisation (§3.3; `egm-design`, `egm-implementation-readiness`):** State that the server trims and upper-cases the input, e.g. `text(body.coupon, 20).toUpperCase()` (helper at `bookings.js:9`). `code = upper(code)` is redundant with the regex.
  - **Foreign key (§3.2 line 67; `egm-inventive-catalyst`, `egm-codebase-details`, `egm-implementation-readiness`):** `coupon_code references coupons(code)` means a used code can't be deleted or renamed. Say "deactivate, never delete", and add an index on `coupon_code`.
  - **Blocking someone else's discount (§3.3 rule 5; `egm-design`, `egm-implementation-readiness`, `egm-inventive-catalyst`):** Signed-out course bookings accept any `contact_email` (`bookings.js:88-97`), so anyone can make another person ineligible. Match only paid or claimed bookings, or accept and document it.
  - **Validity window (§3.3 rule 1; `egm-implementation-readiness`):** Say that a null `valid_from`/`valid_until` means open-ended, and that the comparison uses ISO strings against `istDate()`.
  - **Preview response (§3.4; `egm-codebase-details`):** Include `advanceAllowed`.
  - **Activity log and email fields (§3.5; `egm-implementation-readiness`, `egm-codebase-details`):** Add `coupon_code` and `discount` to the `logActivity` metadata (`bookings.js:161-167`). Name the new `notify.js` fields (`listAmount`, `discount`, `couponCode`).
  - **Usage report (§2 line 20, Q5; `egm-implementation-readiness`):** Give the per-code count query, or a view, for the owner.
  - **Legacy tables and paths (§3.1 line 42, §3.3; `egm-codebase-details`):** Mention the legacy re-pricing path at `create-order.js:57-66`. Say whether the legacy `activity_bookings` table is deliberately left out of the first-booking check.
  - **Too much implementation detail (§3.1 lines 35-39; `egm-zoom-out`):** The pseudocode could be one sentence.
  - **Fetching new columns (§3.5; `egm-codebase-details`):** Checkout and admin already `select("*")` (`CheckoutClient.tsx:158`, `admin.ts:213`), so the new columns arrive without query changes. Only the types need updating.
