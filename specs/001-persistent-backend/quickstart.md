# Quickstart & Validation: Persistent Customer Backend

This guide shows how to stand the feature up and **prove it works end to end**. It refers to [contracts/](./contracts/) and [data-model.md](./data-model.md) rather than repeating them. All commands run from `adventure-travel/` unless noted.

## 1. Prerequisites

| Need | Why |
|---|---|
| A **Supabase** project (a separate *dev* and *prod* project is recommended) | database, auth, realtime |
| **Razorpay** account in **Test mode** | payments without real money |
| An SMTP mailbox (for example Gmail plus an App Password) | outbox emails and Supabase auth emails |
| A Google Cloud OAuth client (Web) | "Continue with Google" |
| Vercel CLI (`npx vercel`) linked to the project | local functions (`vercel dev`) and env vars |
| Node 22 | matches the function runtime |

## 2. One-time setup

1. **Database**: in the Supabase SQL Editor, run these in order:
   1. `supabase-schema.sql`
   2. `supabase-activity-payments.sql`
   3. `supabase-backend.sql`
   4. `supabase-room-sharing.sql`
   5. `supabase-payments-v2.sql` *(new in this feature)*
   
   Then grant yourself admin with the snippet at the top of `supabase-activity-payments.sql`, and sign out and back in.
2. **Supabase Auth**:
   - Enable **Confirm email**.
   - Set **custom SMTP** to the mailbox (research R8).
   - Set the Site URL to your domain, and add `/dashboard` and `/reset-password` to Redirect URLs.
   - Enable the **Google** provider with the OAuth client. The Google redirect URI is `https://<ref>.supabase.co/auth/v1/callback`.
3. **Environment variables** (Vercel → Production *and* Development; see `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `BOOKING_TO_EMAIL`
   - `CRON_SECRET` *(new)*
4. **Razorpay webhook** (Test mode): point it at `https://<deployment>/api/razorpay-webhook` for the events `payment.captured`, `order.paid` and `payment.failed`.
5. **Catalog**: run `npm run catalog`. It must print the trek and course counts with no errors.

## 3. Automated checks

```bash
npx tsc --noEmit        # types
npm run lint            # lint
npx vitest run          # pricing, advance/balance/due-date rules, signatures, dedupe keys (research R13)
npm run build           # static export; FAILS by design if Supabase env vars are missing in production mode
```
Don't run `npm run build` while `npm run dev` is running, because they share `.next/`. To run the API locally, use `npx vercel dev`, because `next dev` doesn't serve `api/`.

## 4. Validation scenarios

Use two browsers (A and B) or one normal and one private window. Use Razorpay test UPI or test cards.

| # | Scenario | Steps | Expected | Proves |
|---|---|---|---|---|
| V1 | Cross-device persistence | A: sign up and confirm the email, then book a trek (2 persons, a room tier if offered). B: sign in | The booking is in B's dashboard with the same amount within 1 minute | US1, FR-001/010/016, SC-001 |
| V2 | Google sign-in | Use "Continue with Google" with a new Gmail | Lands on `/dashboard` signed in, with a profile row created | FR-003 |
| V3 | Identity linking | Sign up with a password using email X (verified), then sign in with Google as X. Repeat with an **unverified** password account | One account each time (check `auth.users`). If the unverified case creates a duplicate, apply the R9 mitigation | FR-003 |
| V4 | Price lock | Book a trek, change its price in `treks.ts`, run `npm run catalog`, redeploy, then pay | The charge equals the **original** booking amount | FR-016 |
| V5 | Tampering | In devtools, POST `/api/bookings` with an extra `"amount": 1` | The stored amount is the catalog amount, so the field is ignored | FR-016, SC-005 |
| V6 | Advance then balance | Book a trek starting more than 15 days away, choose **30% advance**, pay, then **Pay balance** | Payments show `advance` then `balance`. The state goes `advance_paid` → `fully_paid`. The due date is start − 15 days, and the customer and admin views match | US3, FR-020, FR-020b, FR-020c, FR-023, SC-011 |
| V7 | Advance cut-off | Book a start date 10 days away | Only "Pay in full" is offered; a forced `kind=advance` gets **400** | FR-020a |
| V8 | Webhook-only completion | Start a payment, complete it in the Razorpay modal, close the tab **before** the success screen | Within 5 minutes the payment is `paid` and the booking `confirmed`, with exactly one receipt email | FR-025, SC-004 |
| V9 | Double report | Replay the same `payment.captured` webhook (Razorpay dashboard → resend) | `amount_paid` is unchanged, with no second receipt | FR-025 |
| V10 | Already paid | Call `create-order` with `kind=full` on a `fully_paid` booking | **409** | FR-026 |
| V11 | Signed-out course to account | Signed out, book a course as Y. Then sign up as Y and confirm | The booking appears in the dashboard and is payable. An unverified Y, or a different email, sees nothing | US6, FR-012 |
| V12 | Admin manage | As admin, find the V1 booking by phone, set it `cancelled`, then `pending` | Done in under 30 s. `booking_status_events` has 2 rows with `changed_by` = admin. The customer sees the status | US2, FR-042, SC-006 |
| V13 | Isolation | As customer B, query A's booking id via the Supabase client, and open `/admin/*` | No rows and access refused | FR-045, SC-009 |
| V14 | Email outage | Set a wrong `SMTP_PASS`, book, then restore it and run the cron (`curl -H "Authorization: Bearer $CRON_SECRET" …/api/cron`) | The booking is saved and visible. The notification is `failed`, then `sent` after the cron | FR-032, SC-002 |
| V15 | Reminders | Set a test booking's `balance_due_date` to today + 7, run the cron twice | Exactly one `balance_reminder_7d` is sent | FR-020d, SC-012 |
| V16 | Overdue flag | Set `balance_due_date` to yesterday on an `advance_paid` booking | The admin list shows it as overdue, with no automatic change | FR-020e |
| V17 | Payments down | Remove the `RAZORPAY_*` vars on a preview deploy and try to pay | A clear message plus WhatsApp; the booking stays payable later | FR-060, SC-008 |
| V18 | Database down | Preview deploy without the Supabase vars: try to book | No false success; a WhatsApp link pre-filled with the details | FR-061, SC-008 |
| V19 | Legacy data | In a browser, set `localStorage.eht_users` and `eht_session`, then load the site | A one-time notice with WhatsApp; the keys are gone afterwards, and there's no notice on reload | US7, FR-050/051, SC-013 |
| V20 | Cancel own booking | Customer cancels a pending, unpaid booking, then tries a paid one | The first succeeds; the paid one has no cancel option and the database refuses it | US5, FR-015 |
| V21 | Account deletion | Customer with a paid booking requests deletion | Logged out, profile anonymised, payment rows still present with `user_id` null | FR-070 |
| V22 | Activity request | Request an activity from `/activities` | It appears in the dashboard and admin list, with no pay button | FR-013 |

## 5. Go-live checklist
- Move Razorpay to **Live** keys and a live webhook. Enable **international payments** if you want customers from abroad.
- Run the production database migrations.
- Set **Production** env vars on Vercel, then redeploy.
- Make one real ₹1 test booking and payment end to end, then refund it in the Razorpay dashboard.
- Update the trek pages, Terms & Conditions and cancellation policy to the same advance/full terms (spec Assumptions).

## Results

| Run | Date | Scenarios | Outcome |
|---|---|---|---|
| Offline (no database) | 2026-10-16 | Unit tests | `npx vitest run`: 37/37 passed (pricing incl. room tiers and the IST/15-day rules, notification templates, signature helpers). |
| Offline (no database) | 2026-10-16 | Parse migration | `supabase-payments-v2.sql`: 57 statements and all PL/pgSQL bodies parse with PostgreSQL's parser (libpg-query). Not yet executed against a database. |
| Offline (fake database) | 2026-10-16 | V5 (tampering) and the US1 booking rules | `api/bookings.js` against a recording stub: browser-sent `amount` ignored (stored 1,200,000 paise); room tier priced (Tungnath double × 2 = 1,299,800); unknown room → 400; "10+" → quote; start in 10 days → no advance; past date → 400; signed-out trek → 401; course email stored lower-cased; contact defaults to the profile. |
| **T025: V1–V5, V18, V22** | — | — | **Blocked**: needs a dev Supabase project with the five SQL files applied, plus `npx vercel dev`. Not run yet. |
