-- =============================================
-- Himalayan Arc Adventure — persistence layer
-- Run AFTER supabase-schema.sql and supabase-activity-payments.sql.
-- Additive and idempotent: safe to re-run.
--
-- Adds: richer profiles, stored course bookings, payments for course bookings,
-- admin visibility on every record, and "cancel my own pending booking".
-- =============================================

-- 0. Shared helpers ------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1. Profiles -------------------------------------------------------------------
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists city text not null default '';
alter table public.profiles add column if not exists emergency_contact_name text not null default '';
alter table public.profiles add column if not exists emergency_contact_phone text not null default '';
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Store the email on the profile for new users (also used by the admin views).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    new.email
  );
  return new;
end;
$$;

-- Backfill for existing users.
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

-- Users may edit only their own row (the original policy had no WITH CHECK).
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 2. Course bookings -------------------------------------------------------------
-- Written ONLY by api/course-bookings (service role), so visitors can book while
-- logged out and the server validates and prices every request.
create table if not exists public.course_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,   -- null = booked logged out
  course_slug text not null default '',
  course_name text not null,
  course_type text not null,
  package_name text not null default '',
  stay text not null default '' check (stay in ('', 'base', 'full')),
  preferred_date date not null,
  group_size integer not null check (group_size between 1 and 20),
  amount integer check (amount is null or amount > 0),              -- paise, priced server-side
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists course_bookings_user_idx on public.course_bookings (user_id, created_at desc);
create index if not exists course_bookings_email_idx on public.course_bookings (lower(contact_email));

drop trigger if exists course_bookings_touch_updated_at on public.course_bookings;
create trigger course_bookings_touch_updated_at
  before update on public.course_bookings
  for each row execute function public.touch_updated_at();

alter table public.course_bookings enable row level security;

drop policy if exists "Users can view own course bookings" on public.course_bookings;
create policy "Users can view own course bookings"
  on public.course_bookings for select
  using (auth.uid() = user_id);

drop policy if exists "Admins can view all course bookings" on public.course_bookings;
create policy "Admins can view all course bookings"
  on public.course_bookings for select
  using (public.is_admin());

drop policy if exists "Admins can update course bookings" on public.course_bookings;
create policy "Admins can update course bookings"
  on public.course_bookings for update
  using (public.is_admin())
  with check (public.is_admin());

-- 3. Payments can belong to a trek OR a course booking --------------------------
alter table public.payments alter column booking_id drop not null;
alter table public.payments
  add column if not exists course_booking_id uuid references public.course_bookings(id) on delete cascade;

do $$ begin
  alter table public.payments
    add constraint payments_one_booking check ((booking_id is null) <> (course_booking_id is null));
exception when duplicate_object then null; end $$;

create index if not exists payments_course_booking_idx on public.payments (course_booking_id, created_at desc);

-- 4. Trek / activity bookings: timestamps, admin access, self-cancel -------------
alter table public.trek_bookings add column if not exists updated_at timestamptz not null default now();
alter table public.activity_bookings add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trek_bookings_touch_updated_at on public.trek_bookings;
create trigger trek_bookings_touch_updated_at
  before update on public.trek_bookings
  for each row execute function public.touch_updated_at();

drop trigger if exists activity_bookings_touch_updated_at on public.activity_bookings;
create trigger activity_bookings_touch_updated_at
  before update on public.activity_bookings
  for each row execute function public.touch_updated_at();

drop policy if exists "Admins can view all trek bookings" on public.trek_bookings;
create policy "Admins can view all trek bookings"
  on public.trek_bookings for select using (public.is_admin());

drop policy if exists "Admins can update trek bookings" on public.trek_bookings;
create policy "Admins can update trek bookings"
  on public.trek_bookings for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can view all activity bookings" on public.activity_bookings;
create policy "Admins can view all activity bookings"
  on public.activity_bookings for select using (public.is_admin());

drop policy if exists "Admins can update activity bookings" on public.activity_bookings;
create policy "Admins can update activity bookings"
  on public.activity_bookings for update using (public.is_admin()) with check (public.is_admin());

-- A user may cancel their own booking while it is still pending — nothing else.
drop policy if exists "Users can cancel own pending trek bookings" on public.trek_bookings;
create policy "Users can cancel own pending trek bookings"
  on public.trek_bookings for update
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'cancelled');

-- 5. Activity feed knows about course bookings ----------------------------------
do $$ begin
  alter type public.activity_action add value if not exists 'COURSE_BOOKING_CREATED';
exception when others then null; end $$;
