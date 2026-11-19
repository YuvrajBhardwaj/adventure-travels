-- =============================================
-- Himalayan Arc Adventure — nationality on bookings
-- Run AFTER supabase-payment-guard.sql (the setup script runs it last).
-- Additive and idempotent: safe to re-run.
--
-- Foreign nationals pay 3× the listed price (owner, 20 Nov 2026). The booking form asks
-- "Indian national / Foreign national"; api/bookings.js stores the answer here and locks the
-- amount from it (api/_lib/pricing.js). Existing bookings default to 'indian', which is what
-- they were charged as.
-- =============================================

alter table public.trek_bookings add column if not exists nationality text not null default 'indian';
alter table public.course_bookings add column if not exists nationality text not null default 'indian';

do $$ begin
  alter table public.trek_bookings
    add constraint trek_bookings_nationality_chk check (nationality in ('indian', 'foreign'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.course_bookings
    add constraint course_bookings_nationality_chk check (nationality in ('indian', 'foreign'));
exception when duplicate_object then null; end $$;

-- PostgREST caches the schema; make the new columns visible to the API now.
notify pgrst, 'reload schema';
