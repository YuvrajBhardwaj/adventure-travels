-- =============================================
-- Himalayan Arc Adventure — trek departure dates (the batch calendar)
-- Run AFTER supabase-payments-v2.sql, in the Supabase SQL Editor.
-- Additive and idempotent: safe to re-run.
--
-- The admin lists each trek's batches at /admin/departures. Visitors see them on the trek
-- page's Dates tab with the seats left; api/bookings.js and api/create-order.js refuse a
-- closed or full batch. A date that isn't a listed batch is a private-departure request.
-- Proposed 2026–27 dates: supabase-departures-seed.sql (run once, separately).
-- =============================================

create table if not exists public.trek_departures (
  id uuid primary key default gen_random_uuid(),
  trek_slug text not null check (char_length(trek_slug) between 1 and 80),
  start_date date not null,
  capacity integer not null check (capacity between 1 and 100),
  -- Seats sold outside the website (WhatsApp, phone), entered by the admin.
  offline_seats integer not null default 0 check (offline_seats between 0 and 100),
  -- Closed by the admin (weather, cancelled, private hire): still listed, not bookable.
  closed boolean not null default false,
  -- Optional label on the date, e.g. "Stargazing" or "New group".
  tag text not null default '' check (char_length(tag) <= 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trek_slug, start_date)
);

drop trigger if exists trek_departures_touch_updated_at on public.trek_departures;
create trigger trek_departures_touch_updated_at
  before update on public.trek_departures
  for each row execute function public.touch_updated_at();

alter table public.trek_departures enable row level security;

-- Only admins touch the table; visitors read through the function below.
drop policy if exists "Admins can manage departures" on public.trek_departures;
create policy "Admins can manage departures"
  on public.trek_departures for all
  using (public.is_admin())
  with check (public.is_admin());

create index if not exists trek_bookings_slug_date_idx on public.trek_bookings (trek_slug, trek_date);

-- Upcoming batches (starting after today in India) with seats left. A booking holds seats
-- once an admin confirms it or any money is paid. Unpaid requests don't, or anyone could
-- block a batch; create-order checks the seats again before taking money. A "10+" group
-- counts as 10 until the admin confirms the real size with the customer.
-- SECURITY DEFINER so visitors get the counts without reading anyone's bookings.
create or replace function public.trek_departure_availability(p_slug text default null)
returns table (
  id uuid,
  trek_slug text,
  start_date date,
  capacity integer,
  seats_booked integer,
  seats_left integer,
  closed boolean,
  tag text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    d.id,
    d.trek_slug,
    d.start_date,
    d.capacity,
    (d.offline_seats + coalesce(b.seats, 0))::integer,
    greatest(d.capacity - d.offline_seats - coalesce(b.seats, 0), 0)::integer,
    d.closed,
    d.tag
  from public.trek_departures d
  left join lateral (
    select sum(case when tb.group_size ~ '^[0-9]+$' then tb.group_size::integer else 10 end) as seats
    from public.trek_bookings tb
    where tb.trek_slug = d.trek_slug
      and tb.trek_date = d.start_date
      and tb.status <> 'cancelled'
      and (tb.status = 'confirmed' or tb.payment_state in ('advance_paid', 'fully_paid'))
  ) b on true
  where (p_slug is null or d.trek_slug = p_slug)
    and d.start_date > (now() at time zone 'Asia/Kolkata')::date
  order by d.trek_slug, d.start_date;
$$;

revoke all on function public.trek_departure_availability(text) from public;
grant execute on function public.trek_departure_availability(text) to anon, authenticated, service_role;

-- PostgREST caches the schema; make the new table and function visible to the API now.
notify pgrst, 'reload schema';
