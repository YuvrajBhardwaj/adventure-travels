-- =============================================
-- Himalayan Arc Adventure — payment guard
-- Run AFTER supabase-payments-v2.sql (the setup script runs it last).
-- Idempotent: replaces apply_payment() only; no table or column changes.
--
-- Fixes (13 Nov 2026 audit): apply_payment() never looked at the booking before adding
-- money to it, so
--   * an advance order and a full order on one booking could both be paid (overcharge),
--   * an order opened before a cancel or refund still applied to that booking.
-- Razorpay has already captured the money when this runs, so the payment is still
-- recorded as paid, but the booking is left alone and the payment is marked
-- "Needs refund: …" (failure_reason, shown on /admin/payments) for a manual refund.
-- =============================================

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
    select amount, amount_paid, status, payment_state, trek_date, user_id
      into b_amount, b_paid, b_status, b_state, b_start, b_user
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
