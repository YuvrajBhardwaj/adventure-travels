-- =============================================
-- Himalayan Arc Adventure — payment guard
-- Run AFTER supabase-payments-v2.sql (the setup script runs it last).
-- Idempotent: replaces apply_payment() only; no table or column changes.
--
-- Fixes (13 Nov 2026 audit): apply_payment() never looked at the booking before adding
-- money to it, so
--   * an advance order and a full order on one booking could both be paid (overcharge),
--   * an order opened before a cancel or refund still applied to that booking.
--   * (24 Nov) a trek payment landing after the 15-minute seat hold, when the batch has
--     filled or closed meanwhile, confirmed the booking anyway (overbooking).
--   * (25 Nov) the same on dates an admin hasn't listed (daily dates from the season
--     calendar): the booking's seat_capacity, recorded by hold_trek_seats() in
--     supabase-date-seats.sql, is the limit there.
-- Razorpay has already captured the money when this runs, so the payment is still
-- recorded as paid, but the booking is left alone and the payment is marked
-- "Needs refund: …" (failure_reason, shown on /admin/payments) for a manual refund.
-- =============================================

-- Seats per departure on an unlisted date, written when the booking's seats are held for
-- payment (null for listed batches, which keep their own capacity in trek_departures).
alter table public.trek_bookings add column if not exists seat_capacity integer;

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
  b_state text;
  b_start date;
  b_user uuid;
  new_paid integer;
  new_state text;
  new_status text;
  refund_reason text;
  b_held timestamptz;
  b_slug text;
  b_group text;
  b_cap integer;
  d_cap integer;
  d_offline integer;
  d_closed boolean;
  taken integer;
  wanted integer;
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
    select amount, amount_paid, status, payment_state, trek_date, user_id, seats_held_until, trek_slug, group_size, seat_capacity
      into b_amount, b_paid, b_status, b_state, b_start, b_user, b_held, b_slug, b_group, b_cap
      from public.trek_bookings where id = bid for update;
  else
    select amount, amount_paid, status, payment_state, preferred_date, user_id
      into b_amount, b_paid, b_status, b_state, b_start, b_user
      from public.course_bookings where id = bid for update;
  end if;

  new_paid := coalesce(b_paid, 0) + pay.amount;

  -- The booking can't take this money: record it, flag it, leave the booking as it is.
  refund_reason := case
    when b_status = 'cancelled' then 'booking was cancelled'
    when b_state = 'refunded' then 'booking was refunded'
    when b_amount is not null and new_paid > b_amount then 'booking would be overpaid'
  end;

  -- A trek booking that doesn't own its seats yet, paid after its seat hold ran out: the batch
  -- may have filled (or closed) meanwhile. Count it the way hold_trek_seats() does
  -- (supabase-departures.sql); same lock order (booking, then departure).
  if refund_reason is null and btype = 'trek' and b_status <> 'confirmed' and b_state = 'unpaid'
     and (b_held is null or b_held < now()) then
    select capacity, offline_seats, closed into d_cap, d_offline, d_closed
      from public.trek_departures where trek_slug = b_slug and start_date = b_start for update;
    if found then
      wanted := case when b_group ~ '^[0-9]+$' then b_group::integer else 10 end;
      select d_offline + coalesce(sum(case when tb.group_size ~ '^[0-9]+$' then tb.group_size::integer else 10 end), 0)
        into taken
        from public.trek_bookings tb
       where tb.trek_slug = b_slug
         and tb.trek_date = b_start
         and tb.id <> bid
         and tb.status <> 'cancelled'
         and (tb.status = 'confirmed' or tb.payment_state in ('advance_paid', 'fully_paid') or tb.seats_held_until > now());
      refund_reason := case
        when d_closed then 'batch was closed after the seat hold ran out'
        when d_cap - taken < wanted then 'batch filled up after the seat hold ran out'
      end;
    elsif b_cap is not null then
      -- An unlisted (daily) date: the capacity recorded at the seat hold, under the same
      -- per-date lock hold_trek_seats() takes (supabase-date-seats.sql).
      perform pg_advisory_xact_lock(hashtext('trek_date_seats:' || b_slug || ':' || b_start::text));
      wanted := case when b_group ~ '^[0-9]+$' then b_group::integer else 10 end;
      select coalesce(sum(case when tb.group_size ~ '^[0-9]+$' then tb.group_size::integer else 10 end), 0)
        into taken
        from public.trek_bookings tb
       where tb.trek_slug = b_slug
         and tb.trek_date = b_start
         and tb.id <> bid
         and tb.status <> 'cancelled'
         and (tb.status = 'confirmed' or tb.payment_state in ('advance_paid', 'fully_paid') or tb.seats_held_until > now());
      if b_cap - taken < wanted then
        refund_reason := 'date filled up after the seat hold ran out';
      end if;
    end if;
  end if;
  if refund_reason is not null then
    update public.payments
       set status = 'paid',
           razorpay_payment_id = p_payment_id,
           method = coalesce(p_method, method),
           failure_reason = 'Needs refund: ' || refund_reason,
           paid_at = now()
     where id = pay.id;
    if b_user is not null then
      insert into public.activity_logs (user_id, action_type, metadata)
      values (b_user, 'PAYMENT_SUCCESS', jsonb_build_object(
        'order_id', p_order_id, 'payment_id', p_payment_id, 'amount', pay.amount,
        'kind', pay.kind, 'booking_type', btype, 'booking_id', bid,
        'needs_refund', refund_reason
      ));
    end if;
    return jsonb_build_object(
      'result', 'needs_refund',
      'reason', refund_reason,
      'booking_type', btype,
      'booking_id', bid,
      'payment_id', pay.id,
      'payment_amount', pay.amount
    );
  end if;

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

notify pgrst, 'reload schema';
