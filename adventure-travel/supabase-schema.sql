-- =============================================
-- Himalayan Arc Adventure — Supabase Schema
-- Run this in the Supabase SQL Editor
-- =============================================

-- 1. Users profile table (extends Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Trek Bookings
create table if not exists public.trek_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trek_name text not null,
  trek_slug text not null,
  trek_date date not null,
  group_size text not null default '1',
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

-- 3. Activity Bookings
create table if not exists public.activity_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_name text not null,
  activity_type text not null,
  activity_date date not null,
  group_size text not null default '1',
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

-- 4. Row Level Security — users can only read their own data
alter table public.profiles enable row level security;
alter table public.trek_bookings enable row level security;
alter table public.activity_bookings enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can view own trek bookings"
  on public.trek_bookings for select
  using (auth.uid() = user_id);

create policy "Users can insert own trek bookings"
  on public.trek_bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can view own activity bookings"
  on public.activity_bookings for select
  using (auth.uid() = user_id);

create policy "Users can insert own activity bookings"
  on public.activity_bookings for insert
  with check (auth.uid() = user_id);

-- 5. Admin access (optional — for you to view all bookings)
-- Uncomment if you want a service role or admin policy:
-- create policy "Admins can view all trek bookings"
--   on public.trek_bookings for select
--   using (auth.uid() in (select id from auth.users where raw_user_meta_data ->> 'role' = 'admin'));

-- create policy "Admins can view all activity bookings"
--   on public.activity_bookings for select
--   using (auth.uid() in (select id from auth.users where raw_user_meta_data ->> 'role' = 'admin'));
