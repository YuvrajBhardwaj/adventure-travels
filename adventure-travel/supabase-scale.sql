-- =============================================
-- Himalayan Arc Adventure — speed and safety at scale
-- Run LAST, after supabase-departures.sql. Additive and idempotent: safe to re-run.
--
-- 1. Indexes for the queries that grow with traffic: each customer's dashboard, the admin
--    lists (newest first) and the daily balance-reminder job.
-- 2. Row-level security rules evaluate auth.uid() / is_admin() once per query instead of
--    once per row (Supabase advisor "auth_rls_initplan"). Same rules, same results.
-- 3. Fixed search_path on three helper functions (Supabase advisor).
-- 4. Explicit table grants. From 30 Oct 2026 Supabase no longer grants new tables to the
--    API roles automatically, so a fresh project set up from these files needs them.
--    Row-level security stays the only thing deciding who sees which row.
-- =============================================

-- 1. Indexes -------------------------------------------------------------------------------
create index if not exists trek_bookings_user_idx on public.trek_bookings (user_id, created_at desc);
create index if not exists trek_bookings_created_idx on public.trek_bookings (created_at desc);
create index if not exists activity_bookings_user_idx on public.activity_bookings (user_id, created_at desc);
create index if not exists activity_bookings_created_idx on public.activity_bookings (created_at desc);
create index if not exists course_bookings_created_idx on public.course_bookings (created_at desc);
create index if not exists payments_created_idx on public.payments (created_at desc);
create index if not exists profiles_created_idx on public.profiles (created_at desc);
create index if not exists trek_bookings_balance_due_idx
  on public.trek_bookings (balance_due_date) where payment_state = 'advance_paid';
create index if not exists course_bookings_balance_due_idx
  on public.course_bookings (balance_due_date) where payment_state = 'advance_paid';

-- 2. Row-level security: wrap auth.uid() and is_admin() in a sub-select ---------------------
-- Rewrites every policy in place (names and rules unchanged). Policies already wrapped are
-- skipped, so re-running the earlier files and then this one always ends in the same state.
do $$
declare
  p record;
  q text;
  c text;
  stmt text;
begin
  for p in select schemaname, tablename, policyname, qual, with_check from pg_policies where schemaname = 'public' loop
    q := regexp_replace(
           regexp_replace(p.qual, '(?<!SELECT )auth\.uid\(\)', '(select auth.uid())', 'g'),
           '(?<!SELECT )(?<!\.)(public\.)?is_admin\(\)', '(select public.is_admin())', 'g');
    c := regexp_replace(
           regexp_replace(p.with_check, '(?<!SELECT )auth\.uid\(\)', '(select auth.uid())', 'g'),
           '(?<!SELECT )(?<!\.)(public\.)?is_admin\(\)', '(select public.is_admin())', 'g');
    if q is not distinct from p.qual and c is not distinct from p.with_check then
      continue;
    end if;
    stmt := format('alter policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
    if p.qual is not null then stmt := stmt || format(' using (%s)', q); end if;
    if p.with_check is not null then stmt := stmt || format(' with check (%s)', c); end if;
    execute stmt;
  end loop;
end $$;

-- 3. Fixed search_path (every name inside these functions is schema-qualified) -------------
alter function public.is_admin() set search_path = '';
alter function public.touch_updated_at() set search_path = '';
alter function public.guard_booking_money() set search_path = '';

-- 4. Explicit grants (matches what Supabase granted automatically before 30 Oct 2026) -----
grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;

notify pgrst, 'reload schema';
