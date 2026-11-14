-- Backfill the private financial ledger for bookings that were already marked paid
-- before the financial trigger was introduced.

do $$
declare
  r record;
begin
  for r in
    select b.id, b.customer_id, b.agency_id, coalesce(b.total_price, 0) as amount
    from public.bookings b
    where b.status = 'paid'
  loop
    perform private.calculate_booking_financials(
      'agency_booking',
      r.id::text,
      r.customer_id,
      r.agency_id,
      r.amount,
      0.15
    );
  end loop;

  for r in
    select
      hb.id,
      hb.customer_id,
      h.owner_id,
      coalesce(hb.total_amount, 0) as amount
    from public.hotel_bookings hb
    join public.room_categories rc on rc.id = hb.room_category_id
    join public.hotels h on h.hotel_id = rc.hotel_id
    where hb.payment_status = 'paid'
  loop
    perform private.calculate_booking_financials(
      'hotel_booking',
      r.id::text,
      r.customer_id,
      r.owner_id,
      r.amount,
      0.04
    );
  end loop;
end;
$$;
