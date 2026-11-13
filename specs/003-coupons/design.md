# Design: Coupon codes (first-booking and partner discounts)

**Status:** Draft v2 (revised after the Goldfish review in [`review.md`](review.md)) · **Date:** 2026-11-12 · **Owner decisions needed:** §9

## 1. Problem

The owner wants percentage discounts at booking time:

1. **First-booking discount:** 10% or 20% off for customers who have never booked with us (e.g. `WELCOME10`).
2. **Partner/campaign codes:** codes given out through other websites, influencers, travel portals or flyers (e.g. `TRAVELPORTAL20`), so we can see which channel brought each booking.
3. **Loyalty codes:** a unique code issued to **one** returning customer (e.g. `LOYAL7K3QX9`). Only that customer can use it, only once. Once claimed, nobody else can use it, even if the code is forwarded.

Today the price is set once in `adventure-travel/api/bookings.js` from the generated catalog and stored as integer paise in `trek_bookings.amount` / `course_bookings.amount` (FR-016). `guard_booking_money()` (`supabase-payments-v2.sql`) makes it server-only. Everything after that reads the stored `amount`: `orderAmount()` in `api/_lib/pricing.js`, `apply_payment()`, the cron reminders and the emails.

## 2. Goals and non-goals

**Goals**
- A signed-in customer enters a code while booking a trek or course and sees the discounted price before confirming.
- The server alone validates the code and computes the discount; the browser never sends an amount.
- The discounted price becomes the locked `amount`, so the advance, balance, Razorpay, webhook, reminders and emails work unchanged.
- The owner creates and pauses codes without a deploy, and sees bookings per code.
- A first-booking code is usable **once per real person**, also across deleted and re-created accounts and email aliases.
- A loyalty code is usable **once, and only by the customer it was issued to**.
- The worst-case loss from any abuse is bounded by a required rupee cap.

**Non-goals (v1)**
- Fixed-₹ coupons, stacking codes, automatic discounts, referral credit, gift cards.
- Adding a code to a booking that already exists.
- An admin UI (v1 uses the Supabase table editor; see §7).
- Discounts on custom-quote bookings (`quote_required`, groups over 10).
- Coupons for signed-out visitors (see §3.4).

## 3. Design

### 3.1 Applied once, at booking creation

`createTrek()` / `createCourse()` in `api/bookings.js` get split into two steps:

- `priceTrek(user, body)` / `priceCourse(user, body)`: validate inputs and return `{ listAmount, option, … }` from the catalog. No database writes, no seat check, no contact-detail requirement.
- `saveTrek(...)` / `saveCourse(...)`: today's seat check, insert, activity log and emails.

With a coupon, the create path is:

```
priced   = priceTrek(user, body)                  // listAmount from the catalog
coupon   = await coupons.redeem(db, user, code, priced, bookingId)   // §3.3, one SQL call, locks the coupon row
amount   = priced.listAmount - coupon.discount    // stored as the locked price
```

The payment pipeline (`create-order`, `verify-payment`, `razorpay-webhook`, `cron`, `apply_payment()`) stays unchanged apart from one check in `create-order` (§3.5).

### 3.2 Data model: new migration `adventure-travel/supabase-coupons.sql`

Runs last, after `supabase-scale.sql`. It is idempotent and follows that file's conventions: explicit grants, `(select auth.uid())` in policies, and `set search_path = ''` on functions. It does **not** redefine `guard_booking_money()`. It adds its own trigger instead, so re-running either file can't undo the other.

```sql
create table if not exists public.coupons (
  code               text primary key check (code ~ '^[A-Z0-9]{4,20}$'),
  percent_off        integer not null check (percent_off between 1 and 50),
  max_discount       integer not null check (max_discount > 0),        -- paise; REQUIRED cap per booking
  first_booking_only boolean not null default false,
  max_redemptions    integer check (max_redemptions is null or max_redemptions > 0),
  valid_until        date,                                            -- inclusive, IST; null = no end
  active             boolean not null default true,
  source             text not null default '',                        -- 'instagram', 'partner:xyz', 'loyalty', …
  assigned_email_key text,                                            -- loyalty: the ONE customer allowed (normalised email)
  created_at         timestamptz not null default now(),
  -- A code issued to one customer is single-use, and never a first-booking code.
  constraint coupons_assigned_single_use check (
    assigned_email_key is null or (max_redemptions = 1 and not first_booking_only)
  )
);
grant select on public.coupons to authenticated;                     -- policy below limits it to admins
grant select, insert, update, delete on public.coupons to service_role;
alter table public.coupons enable row level security;
create policy coupons_admin_read on public.coupons for select to authenticated using (public.is_admin());

-- One row per use. Deliberately NOT tied to auth.users, so deleting an account doesn't erase it.
create table if not exists public.coupon_redemptions (
  id                uuid primary key default gen_random_uuid(),
  code              text not null references public.coupons(code),
  first_booking     boolean not null,                                 -- copy of the coupon flag at redemption
  email_key         text not null,                                    -- normalised email (§3.3)
  phone_key         text not null default '',                         -- last 10 digits
  booking_type      text not null check (booking_type in ('trek', 'course')),
  booking_id        uuid not null,
  discount          integer not null check (discount > 0),
  created_at        timestamptz not null default now()
);
grant select on public.coupon_redemptions to authenticated;           -- admins only, via policy
grant select, insert, update, delete on public.coupon_redemptions to service_role;
alter table public.coupon_redemptions enable row level security;
create policy coupon_redemptions_admin_read on public.coupon_redemptions for select to authenticated using (public.is_admin());
create index if not exists coupon_redemptions_code_idx  on public.coupon_redemptions (code);
create index if not exists coupon_redemptions_email_idx on public.coupon_redemptions (email_key) where first_booking;
create index if not exists coupon_redemptions_phone_idx on public.coupon_redemptions (phone_key) where first_booking and phone_key <> '';

-- On both booking tables:
alter table public.trek_bookings add column if not exists coupon_code text;
alter table public.trek_bookings add column if not exists list_amount integer check (list_amount is null or list_amount > 0);
alter table public.trek_bookings add column if not exists discount    integer not null default 0 check (discount >= 0);
alter table public.trek_bookings drop constraint if exists trek_bookings_discount_consistent;
alter table public.trek_bookings add constraint trek_bookings_discount_consistent check (
  (coupon_code is null and discount = 0) or
  (coupon_code is not null and list_amount is not null and amount = list_amount - discount and discount > 0)
);
-- same on public.course_bookings
```

- `list_amount` is set **only** when a coupon is used. Everywhere else `amount` is the list price, as today. That keeps old rows valid without a backfill.
- New trigger `guard_booking_coupon()` (`security invoker`, `set search_path = ''`) on both tables refuses changes to `coupon_code`, `list_amount` or `discount` from `anon`/`authenticated`, the same pattern as `guard_booking_money()`.

### 3.3 Validation and redemption: `redeem_coupon()` SQL function + `api/_lib/coupons.js`

**`api/_lib/coupons.js`** (pure, unit-tested):
- `normaliseCode(input)` → upper-case, strip spaces; `null` if it doesn't match `^[A-Z0-9]{4,20}$`.
- `emailKey(email)` → lower-case; for `gmail.com` / `googlemail.com`, drop dots and anything after `+` in the local part; for others, drop anything after `+`.
- `phoneKey(phone)` → last 10 digits, or `''`.
- `discountFor(coupon, listAmount)` → `min(floor(listAmount * percent_off / 100 / 100) * 100, max_discount)`: whole rupees, rounded down, capped.

**`public.redeem_coupon(p_code, p_user, p_email_key, p_phone_key, p_booking_type, p_list_amount, p_preview boolean)`** (`security definer`, `set search_path = ''`, executable by `service_role` only). In one transaction it:
1. `select … for update` the coupon row. This serialises concurrent uses of the same code, the same way `hold_trek_seats()` locks the batch row. That closes both the `max_redemptions` race and the double first-booking race.
2. Checks `active` and `valid_until >= today (IST)`. If `assigned_email_key` is set, `p_email_key` must equal it. Otherwise the code is treated as unknown ("This code isn't valid."), so a forwarded loyalty code tells the other person nothing.
3. Checks `max_redemptions` against the count of **live** redemptions (defined below). For a loyalty code (`max_redemptions = 1`), this is the "once claimed, gone" rule. The row lock means two tabs can't both claim it.
4. If `first_booking_only`, the customer must have:
   - no live first-booking redemption on the same `email_key` or `phone_key` (this survives account deletion and aliases);
   - no **paid** booking (`amount_paid > 0`) under this `user_id` in either table, and none in `course_bookings` with `lower(contact_email)` = their email.

   Unpaid, abandoned bookings made without a code don't count, so a visitor who gave up once is still a first-timer.
5. Returns `{ ok, reason, discount }`. With `p_preview = false` it also inserts the redemption row (`booking_id` filled in by the caller's insert in the same request; the function returns the row id and `bookings.js` updates it, or the booking insert passes the id in, whichever is simpler at implementation).

**Live redemption** = its booking has `amount_paid > 0`, **or** it is not cancelled and was created in the last **48 hours**. An unpaid coupon booking therefore holds a use for 48 hours, like the 15-minute seat hold but longer, and then frees it on its own, with no cron job. A refunded booking stays live: the discount was used. *(Owner can change: §9 Q6.)*

**Messages**, all HTTP 400. Messages are deliberately vague until the code is known to exist, so codes can't be guessed:

| Reason | Message |
| --- | --- |
| unknown, inactive, malformed | "This code isn't valid." |
| expired | "This code isn't valid." |
| used up | "This code has reached its limit." |
| first-booking, not eligible | "This code is for your first booking with us." |
| quote-only booking | "Codes can't be used on group quotes. We'll price your group on WhatsApp." |
| not signed in | "Sign in to use a coupon code." |

**Rate limit:** each failed attempt is logged via the existing `logActivity()` (`COUPON_REJECTED`). If a user has 10 or more rejections in the last hour, the API refuses further coupon checks with "Too many attempts. Try again later."

**Issuing loyalty codes:** `public.issue_loyalty_coupon(p_email, p_percent_off, p_max_discount, p_valid_days)` (`security definer`, callable by `service_role` and by admins via `is_admin()`). It:
- generates `LOYAL` + 6 random characters from `A–Z0–9`, excluding the look-alikes `0 O 1 I`, and retries on collision;
- stores the normalised email in `assigned_email_key`, with `max_redemptions = 1` and `source = 'loyalty'`;
- returns the code.

v1: the owner issues codes by hand, by running it from the Supabase SQL editor, and sends the code on WhatsApp or by email. An optional automatic flow is in §9 Q8: the daily cron issues one after a paid trek ends and emails it through the `notifications` outbox.

### 3.4 Coupons require sign-in

Trek bookings already require sign-in. Course bookings can be made signed out, but a **coupon on a course booking requires sign-in**. That gives:
- a verified email to key first-booking checks on;
- a user id to rate-limit on;
- no anonymous guessing of partner codes.

### 3.5 Preview, rollout flag, and the create-order check

- **Preview** = `POST /api/bookings` with `{ type, slug, groupSize, roomSharing | tierId+stay, coupon, preview: true }`. It runs `priceTrek`/`priceCourse` plus `redeem_coupon(…, p_preview => true)` and returns `{ listAmount, discount, amount, coupon, advanceAmount }`. It writes nothing except the rejection log. No new function: the project stays at its own cap of 8 (Vercel Hobby allows 12).
- **Server flag `COUPONS_ENABLED`** (env, default off) controls everything. With it off, `bookings.js` ignores `coupon` and never writes the coupon columns, so deploying the code before the migration is safe. **`NEXT_PUBLIC_COUPONS_ENABLED`** controls whether the field shows (static export, so it's set at build time).
- **create-order:** if a booking has `coupon_code`, `amount_paid = 0` and its redemption is no longer live (older than 48 hours and unpaid), refuse with 409: "Your coupon hold expired. Please book again to use the code." This is the one change to the payment path. Without it, an expired hold could be paid at the discounted price after its use had been given to someone else.

### 3.6 UI

- **Booking forms** (`TrekDetailClient.tsx` via `src/lib/auth.ts`, and `CourseDetailClient.tsx`): a "Have a coupon code?" link opens an `Input` with an "Apply" `Button` (`loading` while previewing). On success it shows the breakdown: list price, `−₹1,250 (WELCOME10)`, total. Changing group, room or stay re-runs the preview. Signed out: "Sign in to use a coupon code." with a sign-in link.
- **Trek form error handling:** today `TrekDetailClient.tsx:201-214` opens the WhatsApp hand-off even when saving fails. When the failure is a **coupon rejection** (400 with a coupon reason), show the message under the field and **don't** open WhatsApp. Other failures keep today's behaviour.
- **Checkout, dashboard, emails** (`CheckoutClient.tsx`, dashboard, `notify.js` `booking_received` / `booking_alert`): when `discount > 0`, show the code and the breakdown. `src/lib/paymentRules.ts` needs no change.
- **Admin bookings** (`src/lib/admin.ts`): a coupon column, for channel tracking.
- **Structured data** keeps the catalog list price.

## 4. Implementation plan

| Phase | Files | Done when |
| --- | --- | --- |
| 1. Pure helpers | `api/_lib/coupons.js`, `api/_lib/__tests__/coupons.test.js` | tests for rounding, cap, email/phone keys, code normalising pass |
| 2. Migration | `supabase-coupons.sql`, `scripts/setup-backend.mjs` | dry-run clean; re-running it and `supabase-scale.sql` in any order is a no-op |
| 3. API | `api/bookings.js` (split price/save, preview, flag), `api/create-order.js` (expired-hold check) | §6 API checks pass on dev Supabase via `npm run dev:api` |
| 4. UI | `src/lib/auth.ts`, `TrekDetailClient.tsx`, `CourseDetailClient.tsx`, `CheckoutClient.tsx`, dashboard, `src/lib/admin.ts`, `notify.js` | e2e preview check passes; tsc + lint clean |
| 5. Rollout | `.env.example`, CHANGELOG, TODO | §8 |

## 5. Alternatives considered

| Option | Why not |
| --- | --- |
| Discount at checkout or create-order | `amount` would change after creation, so the advance/balance maths, open Razorpay orders and the money trigger would all have to handle a moving price. |
| Razorpay Offers | Tied to payment methods and banks; it doesn't know our first-booking rule or our advance + balance model, and the discount wouldn't appear in our database. |
| Codes in `src/data` | Needs a deploy per code, has no usage counting, and the codes would be public in the JS bundle. |
| First-booking check from bookings alone | Account deletion wipes the email and Gmail aliases slip through, so the check is bypassed for free (review blocker 1). |
| Unique index instead of a row lock | Can't express "live" (time-based) uses; the `for update` lock is the pattern already used for seats. |
| No preview in v1 | Simpler, but the customer would only find out at checkout whether the code worked. With the price/save split, preview is a few lines. |

## 6. Testing

- **Unit:** `discountFor` rounding and cap; `emailKey` (`a.b+x@gmail.com` → `ab@gmail.com`, other domains keep dots); `phoneKey`; `normaliseCode`.
- **API on dev Supabase:**
  - preview and create return the same amount;
  - an invalid code gives 400 and creates no row;
  - a second `WELCOME10` booking by the same user, by a re-created account with the same email, and by a `+alias` is refused;
  - a first booking abandoned without a code still qualifies;
  - an unpaid coupon booking older than 48 hours frees its use, and `create-order` refuses it;
  - two parallel creates on a code with `max_redemptions = 1` give exactly one success;
  - a loyalty code works for its customer (also via a `+alias` of their email), returns "This code isn't valid." for anyone else, and is refused for its own customer after one paid use;
  - the advance is 30% of the discounted amount;
  - the 11th rejection in an hour is rate-limited;
  - with `COUPONS_ENABLED` off, behaviour is identical to today.
- **E2E** (`e2e/`, preview only, never books): the field shows the breakdown; a bad code doesn't open WhatsApp.

## 7. Risks

- **Fraud with fresh identities:** a new email and a new phone number still qualify as first-timers. The required `max_discount` caps the loss per booking.
- **Table-editor mistakes:** the owner could set the wrong percentage. Check constraints limit it to 1–50% with a required cap. Changes to a code don't affect bookings already made, since their amount is locked.
- **48-hour hold** is a guess. Too short annoys slow payers; too long lets an unpaid booking block a capped code. It's one constant in `redeem_coupon()`.

## 8. Rollout

1. Owner approves `supabase-coupons.sql` after `node scripts/setup-backend.mjs --dry-run` (existing rule for live DB changes).
2. Deploy the code with both flags off. Nothing changes for visitors.
3. Owner creates `WELCOME10` in the table editor. Turn on `COUPONS_ENABLED` and `NEXT_PUBLIC_COUPONS_ENABLED` for a preview deployment, test with Razorpay TEST, then turn them on in production.
4. CHANGELOG (Backend tracker: migration, 2 env vars, testing) and TODO updated with each phase.

## 9. Open questions for the owner

1. **10% or 20%** for first-timers, and the **cap** (for example a maximum of ₹3,000 off a booking)?
2. First-booking discount on **ski courses** too, or treks only? (If treks only, add `applies_to` back to `coupons`.)
3. Should past **WhatsApp/offline** customers be excluded? The site can only check online bookings.
4. Is the discount **per booking**, with every person in the group getting the % off, as designed?
5. Do **partners earn commission** per code? (A monthly report is one query on `coupon_redemptions`.)
6. After a **refund**, can the customer use the first-booking code again? (Designed: no. After an unpaid cancellation: yes.)
7. Is a **48-hour** payment window for coupon bookings right?
8. **Loyalty codes:** what % and cap, and how long they stay valid (for example 12 months)? Issued **by hand** (v1), or **automatically** by email after every paid trek ends? Can a loyalty code be used on a booking for a group (designed: yes, the whole booking)?

## Appendix: Review response

| Review finding | Resolution |
| --- | --- |
| B1 First-booking unbuildable and bypassable | `coupon_redemptions` keyed on normalised email and phone, kept after account deletion; trek check by `user_id`; `max_discount` required (§3.2–3.3) |
| B2 Preview can't share the create path | Price/save split; preview skips seats, contact details and writes (§3.1, §3.5) |
| M1 Unpaid bookings never expire, so uses are wasted | "Live" = paid, or unpaid and under 48 hours; only paid bookings disqualify a first-timer (§3.3) |
| M2 Race fix unbuildable | `for update` lock on the coupon row in `redeem_coupon()` |
| M3 Migration order breaks hardening | Separate `guard_booking_coupon()` trigger; follows `supabase-scale.sql` conventions |
| M4 Grants/policy mismatch | `authenticated` select grant + `is_admin()` policy |
| M5 Code enumeration | Vague messages, sign-in required, rate limit |
| M6 Refund vs cancel contradiction | Refunded = still used; unpaid cancel = freed (§3.3, §9 Q6) |
| M7 Rollout gate had no mechanism | `COUPONS_ENABLED` / `NEXT_PUBLIC_COUPONS_ENABLED` |
| M8 Missing implementation detail | §3.3 interfaces and message table, §3.2 constraint SQL, §4 phases |
| M9 Scope/Risks | Dropped `valid_from` and `applies_to`; added §7 |
| M10 WhatsApp opens on rejection | §3.6 |
| 8-function wording | Fixed: project cap of 8, Vercel allows 12 |
