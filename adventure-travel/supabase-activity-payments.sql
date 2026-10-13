-- =============================================
-- Himalayan Arc Adventure — Activity log + Payments
-- Run AFTER supabase-schema.sql, in the Supabase SQL Editor.
-- Safe to re-run.
-- =============================================

-- 0. Admin check -------------------------------------------------------------
-- Reads app_metadata (only the service role can write it). Do NOT use
-- user_metadata for roles: signed-in users can edit their own user_metadata.
--
-- Grant yourself admin once, then sign out/in so the JWT picks it up:
--   update auth.users
--   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'
--   where email = 'you@example.com';
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

-- 1. Activity log -------------------------------------------------------------
do $$ begin
  create type public.activity_action as enum (
    'SIGNUP',
    'LOGIN',
    'BOOKING_CREATED',
    'PAYMENT_INITIATED',
    'PAYMENT_SUCCESS',
    'PAYMENT_FAILED',
    'SETTINGS_UPDATE'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  action_type public.activity_action not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint activity_logs_metadata_size check (pg_column_size(metadata) < 4096)
);

create index if not exists activity_logs_created_at_idx on public.activity_logs (created_at desc);
create index if not exists activity_logs_user_idx on public.activity_logs (user_id, created_at desc);

alter table public.activity_logs enable row level security;

drop policy if exists "Users can view own activity" on public.activity_logs;
create policy "Users can view own activity"
  on public.activity_logs for select
  using (auth.uid() = user_id);

drop policy if exists "Admins can view all activity" on public.activity_logs;
create policy "Admins can view all activity"
  on public.activity_logs for select
  using (public.is_admin());

-- Browsers may only log low-trust events about themselves. SIGNUP comes from a
-- trigger and PAYMENT_* from the API functions (service role), so neither can be forged.
drop policy if exists "Users can log own client events" on public.activity_logs;
create policy "Users can log own client events"
  on public.activity_logs for insert
  with check (
    auth.uid() = user_id
    and action_type in ('LOGIN', 'BOOKING_CREATED', 'SETTINGS_UPDATE')
  );

-- Admins need to resolve names for the feed.
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- 2. SIGNUP is logged by the database, not the browser ------------------------
create or replace function public.log_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.activity_logs (user_id, action_type, metadata)
  values (
    new.id,
    'SIGNUP',
    jsonb_build_object(
      'full_name', new.full_name,
      'email', (select email from auth.users where id = new.id)
    )
  );
  return new;
end;
$$;

drop trigger if exists on_profile_created_log on public.profiles;
create trigger on_profile_created_log
  after insert on public.profiles
  for each row execute function public.log_signup();

-- One-off: give existing users a SIGNUP entry so the feed isn't empty.
insert into public.activity_logs (user_id, action_type, metadata, created_at)
select p.id, 'SIGNUP', jsonb_build_object('full_name', p.full_name, 'email', u.email, 'backfilled', true), p.created_at
from public.profiles p
join auth.users u on u.id = p.id
where not exists (
  select 1 from public.activity_logs l where l.user_id = p.id and l.action_type = 'SIGNUP'
);

-- Live updates for the admin feed.
do $$ begin
  alter publication supabase_realtime add table public.activity_logs;
exception when duplicate_object then null; end $$;

-- 3. Payments -----------------------------------------------------------------
-- Written ONLY by the API functions using the service-role key. There are
-- deliberately no insert/update/delete policies for browsers.
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  booking_id uuid not null references public.trek_bookings(id) on delete cascade,
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  amount integer not null check (amount > 0),   -- paise
  currency text not null default 'INR',
  status text not null default 'created' check (status in ('created', 'paid', 'failed')),
  method text,
  failure_reason text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists payments_booking_idx on public.payments (booking_id, created_at desc);
create index if not exists payments_user_idx on public.payments (user_id, created_at desc);

alter table public.payments enable row level security;

drop policy if exists "Users can view own payments" on public.payments;
create policy "Users can view own payments"
  on public.payments for select
  using (auth.uid() = user_id);

drop policy if exists "Admins can view all payments" on public.payments;
create policy "Admins can view all payments"
  on public.payments for select
  using (public.is_admin());
