-- Seats on generated daily dates (25 Nov 2026, owner approved).
--
-- The Dates calendar lists every day of a trek's season (src/data/trekSeasons.ts), but only
-- dates an admin listed in trek_departures had a seat count, so a busy generated day never
-- showed "Filling fast" or "Full". This file adds:
--   1. trek_date_seats(slug): seats taken on each upcoming date (counts only, no names), for
--      the calendar. A booking takes seats once confirmed or paid, or while held for payment,
--      exactly as for listed batches.
--   2. hold_trek_seats(booking, minutes, capacity): the seat hold, now also enforcing the trek's
--      group size on dates that aren't listed batches. Listed batches go through the existing
--      2-argument function unchanged. Concurrent checkouts for the same trek and date take
--      turns through an advisory lock, so the last seats can't be held twice.
-- Safe to re-run. Run after supabase-departures.sql (and supabase-nationality.sql).

create or replace function public.trek_date_seats(p_slug text)
returns table (start_date date, seats_taken integer)
language sql
stable
security definer
set search_path = ''
as $$
  select
    tb.trek_date,
    sum(case when tb.group_size ~ '^[0-9]+$' then tb.group_size::integer else 10 end)::integer
  from public.trek_bookings tb
  where tb.trek_slug = p_slug
    and tb.trek_date > (now() at time zone 'Asia/Kolkata')::date
    and tb.status <> 'cancelled'
    and (tb.status = 'confirmed' or tb.payment_state in ('advance_paid', 'fully_paid') or tb.seats_held_until > now())
  group by tb.trek_date
  order by tb.trek_date;
$$;
revoke all on function public.trek_date_seats(text) from public;
grant execute on function public.trek_date_seats(text) to anon, authenticated, service_role;

create or replace function public.hold_trek_seats(p_booking uuid, p_minutes integer, p_capacity integer)
returns table (ok boolean, closed boolean, seats_left integer, held_until timestamptz)
language plpgsql
set search_path = ''
as $$
declare
  b public.trek_bookings%rowtype;
  wanted integer;
  taken integer;
  until_ts timestamptz;
begin
  select * into b from public.trek_bookings where id = p_booking for update;
  if not found then
    raise exception 'booking % not found', p_booking using errcode = 'P0002';
  end if;

  -- A listed batch, a booking that already holds its seats for good, or no capacity given:
  -- the original rules (supabase-departures.sql).
  if p_capacity is null
     or b.status = 'confirmed' or b.payment_state in ('advance_paid', 'fully_paid')
     or exists (select 1 from public.trek_departures d where d.trek_slug = b.trek_slug and d.start_date = b.trek_date) then
    return query select * from public.hold_trek_seats(p_booking, p_minutes);
    return;
  end if;

  -- A generated date: one checkout at a time per trek and date.
  perform pg_advisory_xact_lock(hashtext('trek_date_seats:' || b.trek_slug || ':' || b.trek_date::text));

  wanted := case when b.group_size ~ '^[0-9]+$' then b.group_size::integer else 10 end;
  select coalesce(sum(case when tb.group_size ~ '^[0-9]+$' then tb.group_size::integer else 10 end), 0)
    into taken
  from public.trek_bookings tb
  where tb.trek_slug = b.trek_slug
    and tb.trek_date = b.trek_date
    and tb.id <> b.id
    and tb.status <> 'cancelled'
    and (tb.status = 'confirmed' or tb.payment_state in ('advance_paid', 'fully_paid') or tb.seats_held_until > now());

  if p_capacity - taken < wanted then
    return query select false, false, greatest(p_capacity - taken, 0), null::timestamptz;
    return;
  end if;

  until_ts := now() + make_interval(mins => greatest(1, least(p_minutes, 60)));
  update public.trek_bookings set seats_held_until = until_ts where id = b.id;
  return query select true, false, p_capacity - taken - wanted, until_ts;
end;
$$;
-- Server only, like the 2-argument version: browsers must not be able to hold seats.
revoke all on function public.hold_trek_seats(uuid, integer, integer) from public, anon, authenticated;
grant execute on function public.hold_trek_seats(uuid, integer, integer) to service_role;

notify pgrst, 'reload schema';
