# Implementation Plan: Persistent Customer Backend

**Branch**: `001-persistent-backend` | **Date**: 2026-10-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-persistent-backend/spec.md`

## Summary

Make every customer record durable and server-owned: accounts, profiles, trek, course and activity bookings, payments, and the activity history. The business needs to be able to manage them, and customers need to be able to pay a **30% advance or the full amount** online.

The technical approach extends what is already in the repo rather than replacing it:
- **Supabase** stays as the store, with RLS as the single authority for who sees what.
- **Vercel Node functions** in `adventure-travel/api/` handle everything that needs a secret or must be trusted:
  - booking creation, with the price locked from the generated catalog
  - Razorpay orders by payment kind
  - payment application through an atomic, idempotent database function
  - account actions
  - a daily cron for balance reminders and email retries
- **Emails** go through an **outbox table**, so a failed send never loses a booking.
- **The browser-only localStorage fallback is removed.** Legacy browsers get a one-time notice, and their old data is cleared.

## Technical Context

**Language/Version**: TypeScript 5 (strict) for the site; JavaScript (CommonJS) on Node.js 22 for serverless functions; SQL (PostgreSQL 15+) for migrations and database functions.

**Primary Dependencies**: Next.js 16 (App Router, `output: "export"`), React 19, `@supabase/supabase-js` 2 / `@supabase/ssr`, `razorpay` (Node SDK), `nodemailer`, framer-motion. New dev dependency: `vitest`.

**Storage**: Supabase Postgres (tables, RLS, triggers, `apply_payment` function) plus Supabase Auth (email/password and Google). Realtime is used for the admin activity feed.

**Testing**: Vitest unit tests for pure server logic in `api/_lib/` (pricing, advance/balance/due-date rules, signatures, dedupe keys). `tsc --noEmit` and ESLint are the gates. The scripted end-to-end validation is [quickstart.md](./quickstart.md) V1–V22 against Razorpay test mode (research R13).

**Target Platform**: Vercel (pre-rendered static pages, Node serverless functions, one daily Cron job); modern mobile and desktop browsers.

**Project Type**: Web application, a static front end plus a serverless API in one Next.js project.

**Performance Goals**: Booking visible to customer and admin within 1 minute (SC-001). Payment flow completes in under 2 minutes for 90% of customers (SC-003). A payment closed mid-flow is correct within 5 minutes (SC-004). Admin can find and change a booking in under 30 seconds (SC-006).

**Constraints**:
- No always-on server (FR-062).
- At most 12 functions per deployment on Vercel Hobby. This plan uses **8** (R3).
- Cron at most daily on Hobby (R6).
- Charges in INR only.
- SMTP volume of about 500 emails a day (R7).
- Amounts always computed on the server (FR-016).
- Never run `next build` while the developer's `next dev` is running, because they share `.next`.

**Scale/Scope**: 21 treks, 5 courses and a few activities; an estimated fewer than 5,000 customers and 1,000 bookings a year; about 6 customer-facing screens touched, plus 3 new admin screens.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the **unratified template**, so there are no project principles to gate against. Formally, the result is **PASS (vacuous)**.

In place of a constitution, this plan holds itself to the spec's non-negotiables. The table below records them, so `/speckit-constitution` can later ratify them as principles:

| Interim guardrail | Source | Pre-design | Post-design |
|---|---|---|---|
| Prices are computed on the server and fixed when booking | FR-016 | ✅ R4: `api/bookings` stamps `amount`; browser insert removed | ✅ data-model validation rules; contract ignores browser prices |
| A booking is never lost to a downstream failure | FR-032, FR-061 | ✅ R7 outbox; R10 removes the false-success fallback | ✅ notifications contract: commit first, then email |
| Each payment is applied exactly once | FR-025 | ✅ R5 `apply_payment` lock and idempotency | ✅ quickstart V8 and V9 |
| Least privilege; RLS is the single authority | FR-040, FR-045 | ✅ R11 | ✅ data-model RLS matrix; data-access contract "never from browser" |
| Financial records survive account deletion | FR-070 | ✅ R12 FK changes | ✅ data-model `ON DELETE SET NULL / RESTRICT` |

**Result**: PASS before and after design. There are no violations, so the Complexity Tracking table is empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-persistent-backend/
├── plan.md              # This file
├── research.md          # Phase 0: decisions R1–R15
├── data-model.md        # Phase 1: entities, state machines, RLS matrix
├── quickstart.md        # Phase 1: setup and validation scenarios V1–V22
├── contracts/
│   ├── http-api.md      # /api/* endpoints
│   ├── data-access.md   # direct browser ↔ database operations under RLS
│   └── notifications.md # email outbox kinds and dedupe keys
├── checklists/
│   └── requirements.md  # spec quality checklist
└── tasks.md             # Phase 2: created by /speckit-tasks
```

### Source Code (repository root)

```text
adventure-travel/
├── supabase-payments-v2.sql            # NEW: payment_state/amount_paid/kind, apply_payment(),
│                                       #      booking_status_events + trigger, notifications,
│                                       #      FK retention changes, drop trek browser-insert policy
├── vercel.json                         # NEW: crons only → /api/cron daily 03:30 UTC
├── .env.example                        # CHANGE: + CRON_SECRET
├── package.json                        # CHANGE: + vitest (dev), "test" script
├── api/
│   ├── bookings.js                     # NEW: trek + course creation (replaces course-bookings.js)
│   ├── create-order.js                 # CHANGE: bookingType + kind (advance|balance|full)
│   ├── verify-payment.js               # CHANGE: → apply_payment RPC + outbox
│   ├── razorpay-webhook.js             # CHANGE: → apply_payment RPC + outbox
│   ├── account.js                      # NEW: claim | delete (replaces claim-bookings.js)
│   ├── cron.js                         # NEW: reminders, retries, overdue count
│   ├── geo.js, rates.js                # unchanged
│   ├── course-bookings.js              # REMOVE (superseded by bookings.js)
│   ├── claim-bookings.js               # REMOVE (superseded by account.js)
│   └── _lib/
│       ├── pricing.js                  # NEW: unit price, amount, advance, balance, due date (IST)
│       ├── notify.js                   # NEW: outbox enqueue + send + templates
│       ├── payments.js                 # CHANGE: wrap apply_payment RPC; keep hmac helpers
│       ├── supabaseAdmin.js            # unchanged
│       ├── catalog.js, courseCatalog.js# generated (npm run catalog)
│       └── __tests__/                  # NEW: vitest unit tests for pricing/notify/payments
├── scripts/gen-price-catalog.mjs       # unchanged (already emits room tiers + courses)
└── src/
    ├── lib/auth.ts                     # CHANGE: remove localStorage paths; createTrekBooking → /api/bookings;
    │                                   #         resetPassword, deleteAccount, payment-state types
    ├── components/
    │   ├── LegacyDataNotice.tsx        # NEW: one-time notice + clear eht_* keys (FR-050/051)
    │   └── PaymentChoice.tsx           # NEW: advance vs full selector with amounts + due date
    └── app/
        ├── layout.tsx                  # CHANGE: mount LegacyDataNotice
        ├── reset-password/page.tsx     # NEW (FR-004)
        ├── login/page.tsx              # CHANGE: "Forgot password?"
        ├── dashboard/page.tsx          # CHANGE: amount paid / balance / due date, Pay balance, delete account
        ├── checkout/CheckoutClient.tsx # CHANGE: kind selection; balance payments; INR copy
        ├── treks/[id]/TrekDetailClient.tsx   # CHANGE: booking via /api/bookings; fix "30% advance" copy
        ├── courses/[course]/CourseDetailClient.tsx # CHANGE: POST /api/bookings
        ├── activities/ActivitiesPageClient.tsx     # CHANGE: activity request form (FR-013)
        ├── cancellation-policy/…, components/TermsConditions.tsx # CHANGE: align payment terms copy
        └── admin/
            ├── activity/…              # existing feed
            ├── bookings/               # NEW: list, search, filter, overdue, status change, refund
            ├── customers/              # NEW: profiles with their bookings and payments
            └── payments/               # NEW: all payments, failed emails panel
```

**Structure Decision**: This is a single Next.js project (`adventure-travel/`) with co-located serverless functions in `api/`, following the repo's existing layout. Shared server-only logic lives in `api/_lib/`, whose underscore prefix keeps it from being deployed as functions. Database changes ship as one new idempotent SQL file that runs after the existing four. The repo root's `specs/` and `.specify/` hold spec-kit artifacts only.

## Implementation order

`/speckit-tasks` should follow the user-story priorities in the spec. Each step is independently demoable:

1. **Foundation**: `supabase-payments-v2.sql`, `api/_lib/pricing.js` with tests, `api/bookings.js`, and removing the localStorage paths (US1).
2. **Admin**: the bookings, customers and payments screens and the audit trigger (US2).
3. **Payments v2**: `create-order` kinds, `apply_payment`, `PaymentChoice`, Pay balance (US3).
4. **Outbox and cron**: `notify.js`, `cron.js`, `vercel.json` (US4 and reminders).
5. **Self-service**: profile, cancel, reset password, delete account (US5).
6. **Claim and legacy**: `api/account` claim and `LegacyDataNotice` (US6, US7).
7. **Copy alignment and go-live checklist**: quickstart §5.

## Complexity Tracking

No constitution violations to justify. Consolidating functions (R3) is a platform-limit choice, not added complexity: it reduces the function count from a naive 11 to 8.
