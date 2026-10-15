-- =============================================
-- Himalayan Arc Adventure — payments v2 (advance / balance / full),
-- audit trail, email outbox, record retention.
-- Run AFTER supabase-room-sharing.sql, in the Supabase SQL Editor.
-- Additive and idempotent: safe to re-run.
-- Design: specs/001-persistent-backend/data-model.md
-- =============================================

-- ─── T005: booking / payment columns ─────────────────────────────────────────

-- Trek bookings now carry their price, locked when the booking is made (FR-016).
alter table public.trek_bookings
  add column if not exists amount integer check (amount is null or amount > 0);  -- paise

-- Both priced booking types track what has been paid.
alter table public.trek_bookings add column if not exists quote_required boolean not null default false;
alter table public.trek_bookings add column if not exists amount_paid integer not null default 0 check (amount_paid >= 0);
alter table public.trek_bookings add column if not exists payment_state text not null default 'unpaid'
  check (payment_state in ('unpaid', 'advance_paid', 'fully_paid', 'refunded'));
alter table public.trek_bookings add column if not exists balance_due_date date;

alter table public.course_bookings add column if not exists quote_required boolean not null default false;
alter table public.course_bookings add column if not exists amount_paid integer not null default 0 check (amount_paid >= 0);
alter table public.course_bookings add column if not exists payment_state text not null default 'unpaid'
  check (payment_state in ('unpaid', 'advance_paid', 'fully_paid', 'refunded'));
alter table public.course_bookings add column if not exists balance_due_date date;

-- Each Razorpay order is one kind of payment.
alter table public.payments add column if not exists kind text not null default 'full'
  check (kind in ('advance', 'balance', 'full'));

alter table public.profiles add column if not exists deleted_at timestamptz;

do $$ begin
  alter type public.activity_action add value if not exists 'ADMIN_STATUS_CHANGE';
exception when others then null; end $$;

-- Bring rows paid under v1 in line: a paid v1 payment was always the full amount.
update public.trek_bookings b
set payment_state = 'fully_paid', amount_paid = p.amount
from public.payments p
where p.booking_id = b.id and p.status = 'paid' and b.payment_state = 'unpaid';

update public.course_bookings b
set payment_state = 'fully_paid', amount_paid = p.amount
from public.payments p
where p.course_booking_id = b.id and p.status = 'paid' and b.payment_state = 'unpaid';

-- ─── T006: record retention on account deletion (research R12) ───────────────
-- Re-point a foreign key with a chosen ON DELETE action, whatever its current name.

create or replace function pg_temp.set_fk(tbl text, col text, ref text, on_delete text)
returns void
language plpgsql
as $$
declare
  c text;
begin
  for c in
    select con.conname
    from pg_constraint con
    join pg_attribute a on a.attrelid = con.conrelid and a.attnum = any (con.conkey)
    where con.conrelid = tbl::regclass and con.contype = 'f' and a.attname = col
  loop
    execute format('alter table %s drop constraint %I', tbl, c);
  end loop;
  execute format(
    'alter table %s add constraint %I foreign key (%I) references %s on delete %s',
    tbl, replace(tbl, 'public.', '') || '_' || col || '_fkey', col, ref, on_delete
  );
end;
$$;

alter table public.trek_bookings alter column user_id drop not null;
alter table public.activity_bookings alter column user_id drop not null;
alter table public.payments alter column user_id drop not null;

select pg_temp.set_fk('public.trek_bookings', 'user_id', 'auth.users(id)', 'set null');
select pg_temp.set_fk('public.activity_bookings', 'user_id', 'auth.users(id)', 'set null');
select pg_temp.set_fk('public.course_bookings', 'user_id', 'public.profiles(id)', 'set null');
select pg_temp.set_fk('public.payments', 'user_id', 'public.profiles(id)', 'set null');
-- A booking with payments can't be deleted; cancel it instead.
select pg_temp.set_fk('public.payments', 'booking_id', 'public.trek_bookings(id)', 'restrict');
select pg_temp.set_fk('public.payments', 'course_booking_id', 'public.course_bookings(id)', 'restrict');

-- ─── T007: policies, money guard, audit trail ────────────────────────────────

-- (a) Trek bookings are created only by api/bookings, which prices them.
drop policy if exists "Users can insert own trek bookings" on public.trek_bookings;

-- (b) Customers may cancel their own booking only while pending and unpaid (FR-015).
drop policy if exists "Users can cancel own pending trek bookings" on public.trek_bookings;
create policy "Users can cancel own pending trek bookings"
  on public.trek_bookings for update
  using (auth.uid() = user_id and status = 'pending' and payment_state = 'unpaid')
  with check (auth.uid() = user_id and status = 'cancelled');

drop policy if exists "Users can cancel own pending course bookings" on public.course_bookings;
create policy "Users can cancel own pending course bookings"
  on public.course_bookings for update
  using (auth.uid() = user_id and status = 'pending' and payment_state = 'unpaid')
  with check (auth.uid() = user_id and status = 'cancelled');

-- (c) Every status / payment-state change, who made it and when (FR-042, FR-046).
create table if not exists public.booking_status_events (
  id uuid primary key default gen_random_uuid(),
  booking_type text not null check (booking_type in ('trek', 'course', 'activity')),
  booking_id uuid not null,
  from_status text,
  to_status text,
  from_payment_state text,
  to_payment_state text,
  changed_by uuid,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists booking_status_events_booking_idx
  on public.booking_status_events (booking_type, booking_id, created_at desc);

alter table public.booking_status_events enable row level security;

drop policy if exists "Admins can view booking events" on public.booking_status_events;
create policy "Admins can view booking events"
  on public.booking_status_events for select
  using (public.is_admin());

drop policy if exists "Owners can view own booking events" on public.booking_status_events;
create policy "Owners can view own booking events"
  on public.booking_status_events for select
  using (
    (booking_type = 'trek' and exists (select 1 from public.trek_bookings b where b.id = booking_id and b.user_id = auth.uid()))
    or (booking_type = 'course' and exists (select 1 from public.course_bookings b where b.id = booking_id and b.user_id = auth.uid()))
    or (booking_type = 'activity' and exists (select 1 from public.activity_bookings b where b.id = booking_id and b.user_id = auth.uid()))
  );

-- (d) Money columns are server-owned. Browsers (roles anon / authenticated) can't
-- change them; an admin may only record a refund. The service role, the SQL editor
-- and SECURITY DEFINER functions (apply_payment) run as other roles and pass.
create or replace function public.guard_booking_money()
returns trigger
language plpgsql
as $$
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  if new.amount is distinct from old.amount
     or new.amount_paid is distinct from old.amount_paid
     or new.balance_due_date is distinct from old.balance_due_date
     or new.quote_required is distinct from old.quote_required then
    raise exception 'Booking amounts can only be changed by the server' using errcode = '42501';
  end if;

  if new.payment_state is distinct from old.payment_state
     and not (public.is_admin() and new.payment_state = 'refunded') then
    raise exception 'Payment state can only be changed by the server (admins may record a refund)' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists trek_bookings_guard_money on public.trek_bookings;
create trigger trek_bookings_guard_money
  before update on public.trek_bookings
  for each row execute function public.guard_booking_money();

drop trigger if exists course_bookings_guard_money on public.course_bookings;
create trigger course_bookings_guard_money
  before update on public.course_bookings
  for each row execute function public.guard_booking_money();

-- (e) Audit trail. activity_bookings has no payment_state, so read it through jsonb.
create or replace function public.log_booking_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  btype text := case tg_table_name
    when 'trek_bookings' then 'trek'
    when 'course_bookings' then 'course'
    else 'activity'
  end;
  old_ps text := to_jsonb(old) ->> 'payment_state';
  new_ps text := to_jsonb(new) ->> 'payment_state';
begin
  if new.status is distinct from old.status or new_ps is distinct from old_ps then
    insert into public.booking_status_events
      (booking_type, booking_id, from_status, to_status, from_payment_state, to_payment_state, changed_by, note)
    values
      (btype, new.id, old.status, new.status, old_ps, new_ps, auth.uid(),
       coalesce(nullif(current_setting('app.change_note', true), ''), ''));

    if public.is_admin() and new.user_id is not null then
      insert into public.activity_logs (user_id, action_type, metadata)
      values (
        new.user_id,
        'ADMIN_STATUS_CHANGE',
        jsonb_build_object(
          'booking_type', btype, 'booking_id', new.id,
          'from', old.status, 'to', new.status,
          'from_payment_state', old_ps, 'to_payment_state', new_ps,
          'admin_id', auth.uid()
        )
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trek_bookings_log_change on public.trek_bookings;
create trigger trek_bookings_log_change
  after update on public.trek_bookings
  for each row execute function public.log_booking_change();

drop trigger if exists course_bookings_log_change on public.course_bookings;
create trigger course_bookings_log_change
  after update on public.course_bookings
  for each row execute function public.log_booking_change();

drop trigger if exists activity_bookings_log_change on public.activity_bookings;
create trigger activity_bookings_log_change
  after update on public.activity_bookings
  for each row execute function public.log_booking_change();

-- ─── T008: email outbox (research R7) ────────────────────────────────────────
-- Written only by the API (service role). Admins can read it to spot failed sends.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in (
    'booking_received', 'booking_alert', 'payment_receipt',
    'payment_alert', 'balance_reminder_7d', 'balance_reminder_due'
  )),
  dedupe_key text not null unique,
  recipient text not null,
  subject text not null,
  body_text text not null,
  booking_type text,
  booking_id uuid,
  payment_id uuid,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists notifications_status_attempts_idx on public.notifications (status, attempts);

alter table public.notifications enable row level security;

drop policy if exists "Admins can view notifications" on public.notifications;
create policy "Admins can view notifications"
  on public.notifications for select
  using (public.is_admin());

-- ─── T009: apply a captured payment exactly once (research R5) ───────────────
-- Called by api/verify-payment and api/razorpay-webhook (service role only). Both may
-- report the same payment at nearly the same moment; the row locks and the
-- "already paid" check make the second call a no-op.
create or replace function public.apply_payment(
  p_order_id text,
  p_payment_id text,
  p_amount integer,
  p_method text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  pay public.payments%rowtype;
  btype text;
  bid uuid;
  b_amount integer;
  b_paid integer;
  b_status text;
  b_start date;
  b_user uuid;
  new_paid integer;
  new_state text;
  new_status text;
begin
  select * into pay from public.payments where razorpay_order_id = p_order_id for update;
  if not found then
    return jsonb_build_object('result', 'unknown_order');
  end if;

  btype := case when pay.course_booking_id is not null then 'course' else 'trek' end;
  bid := coalesce(pay.course_booking_id, pay.booking_id);

  if pay.status = 'paid' then
    return jsonb_build_object('result', 'already', 'booking_type', btype, 'booking_id', bid);
  end if;

  if p_amount is not null and p_amount <> pay.amount then
    if pay.user_id is not null then
      insert into public.activity_logs (user_id, action_type, metadata)
      values (pay.user_id, 'PAYMENT_FAILED', jsonb_build_object(
        'reason', 'amount_mismatch', 'order_id', p_order_id,
        'expected', pay.amount, 'received', p_amount
      ));
    end if;
    return jsonb_build_object('result', 'amount_mismatch');
  end if;

  if btype = 'trek' then
    select amount, amount_paid, status, trek_date, user_id
      into b_amount, b_paid, b_status, b_start, b_user
      from public.trek_bookings where id = bid for update;
  else
    select amount, amount_paid, status, preferred_date, user_id
      into b_amount, b_paid, b_status, b_start, b_user
      from public.course_bookings where id = bid for update;
  end if;

  new_paid := coalesce(b_paid, 0) + pay.amount;
  new_state := case when b_amount is not null and new_paid >= b_amount then 'fully_paid' else 'advance_paid' end;
  new_status := case when b_status = 'pending' then 'confirmed' else b_status end;

  update public.payments
     set status = 'paid',
         razorpay_payment_id = p_payment_id,
         method = coalesce(p_method, method),
         failure_reason = null,
         paid_at = now()
   where id = pay.id;

  -- Picked up by log_booking_change() as the event note.
  perform set_config('app.change_note', pay.kind || ' payment applied', true);

  if btype = 'trek' then
    update public.trek_bookings
       set amount_paid = new_paid,
           payment_state = new_state,
           balance_due_date = case when new_state = 'advance_paid' then b_start - 15 else balance_due_date end,
           status = new_status
     where id = bid;
  else
    update public.course_bookings
       set amount_paid = new_paid,
           payment_state = new_state,
           balance_due_date = case when new_state = 'advance_paid' then b_start - 15 else balance_due_date end,
           status = new_status
     where id = bid;
  end if;

  if b_user is not null then
    insert into public.activity_logs (user_id, action_type, metadata)
    values (b_user, 'PAYMENT_SUCCESS', jsonb_build_object(
      'order_id', p_order_id, 'payment_id', p_payment_id, 'amount', pay.amount,
      'kind', pay.kind, 'method', p_method, 'booking_type', btype, 'booking_id', bid
    ));
  end if;

  return jsonb_build_object(
    'result', 'applied',
    'booking_type', btype,
    'booking_id', bid,
    'payment_id', pay.id,
    'kind', pay.kind,
    'payment_amount', pay.amount,
    'payment_state', new_state,
    'amount_paid', new_paid,
    'amount', b_amount,
    'status', new_status,
    'balance_due_date', case when new_state = 'advance_paid' then b_start - 15 else null end,
    'user_id', b_user
  );
end;
$$;

revoke all on function public.apply_payment(text, text, integer, text) from public, anon, authenticated;
grant execute on function public.apply_payment(text, text, integer, text) to service_role;

-- PostgREST caches the schema; expose the new columns, tables and function now.
notify pgrst, 'reload schema';
