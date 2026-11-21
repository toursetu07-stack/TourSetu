-- Remove the obsolete seven-day cap from hotel booking dates.
-- Keep all safety checks: authenticated customer, non-past check-in,
-- and checkout strictly later than check-in. PostgreSQL DATE values
-- are passed from the browser as ISO YYYY-MM-DD strings.

CREATE OR REPLACE FUNCTION public.guard_hotel_booking_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
declare
  v_price numeric;
  v_room_type text;
  v_hotel_name text;
  v_city text;
  v_address text;
  v_available integer;
  v_nights integer;
  v_subtotal numeric;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if new.customer_id is distinct from (select auth.uid()) then
    raise exception 'Booking customer must match the authenticated user';
  end if;

  if new.booking_status is distinct from 'pending'
     or new.payment_status is distinct from 'unpaid' then
    raise exception 'New hotel bookings must start pending and unpaid';
  end if;

  if new.room_category_id is null
     or new.rooms_booked is null
     or new.rooms_booked < 1 then
    raise exception 'A valid room category and room count are required';
  end if;

  if new.check_in_date is null
     or new.check_out_date is null
     or new.check_in_date < current_date
     or new.check_out_date <= new.check_in_date then
    raise exception 'Invalid hotel booking dates';
  end if;

  select
    rc.price_per_night,
    rc.room_type,
    rc.available_rooms,
    h.hotel_name,
    h.city,
    h.address
  into
    v_price,
    v_room_type,
    v_available,
    v_hotel_name,
    v_city,
    v_address
  from public.room_categories rc
  join public.hotels h on h.hotel_id = rc.hotel_id
  where rc.id = new.room_category_id
    and h.status = 'active'
    and coalesce(h.hide_from_search, false) = false
  for update of rc;

  if not found then
    raise exception 'Hotel room category is not currently bookable';
  end if;

  if new.rooms_booked > v_available then
    raise exception 'Requested rooms exceed current availability';
  end if;

  v_nights := new.check_out_date - new.check_in_date;
  v_subtotal := round(v_price * new.rooms_booked * v_nights, 2);

  new.hotel_name := v_hotel_name;
  new.room_type := v_room_type;
  new.location := trim(both ', ' from coalesce(v_city, '') || ', ' || coalesce(v_address, ''));
  new.price_per_night := v_price;
  new.total_nights := v_nights;
  new.subtotal_amount := v_subtotal;
  new.gateway_fee := round(v_subtotal * 0.02, 2);
  new.service_fee := round(v_subtotal * 0.07, 2);
  new.total_amount := v_subtotal;
  new.cancellation_policy_agreed := true;
  new.booking_status := 'pending';
  new.payment_status := 'unpaid';

  return new;
end;
$function$;
