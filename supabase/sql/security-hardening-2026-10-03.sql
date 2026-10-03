-- TourSetu security hardening 2026-10-03
-- Applied to production before committing this migration artifact.

revoke update (id, email, role, is_approved, approved_at, approval_status, hotel_id, hotel_name)
  on public.profiles from authenticated;
revoke insert (role, is_approved, approved_at, approval_status, hotel_id, hotel_name)
  on public.profiles from authenticated;

revoke update (hotel_id, owner_id, status, hide_from_search)
  on public.hotels from authenticated;
revoke insert (hotel_id, status, hide_from_search)
  on public.hotels from authenticated;

drop policy if exists "Public read approved hotels" on public.hotels;

drop view if exists public.public_hotel_inventory;
create view public.public_hotel_inventory as
select rc.id, rc.created_at, rc.hotel_id, h.hotel_name, h.city, h.address,
       h.room_image, rc.room_type, rc.price_per_night, rc.total_rooms, rc.available_rooms
from public.room_categories rc
join public.hotels h on h.hotel_id = rc.hotel_id
where h.status = 'active' and coalesce(h.hide_from_search, false) = false;

revoke all on public.public_hotel_inventory from anon, authenticated;
grant select on public.public_hotel_inventory to anon, authenticated;

create or replace function public.guard_booking_insert()
returns trigger language plpgsql security definer set search_path = ''
as $function$
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if new.customer_id is distinct from (select auth.uid()) then
    raise exception 'Booking customer must match the authenticated user';
  end if;
  if coalesce(new.status, 'pending') <> 'pending' then
    raise exception 'New bookings must start in pending state';
  end if;
  if new.package_id is null or new.agency_id is null
     or not exists (
       select 1 from public.packages p
       where p.id::text = new.package_id
         and p.agency_id = new.agency_id
         and public.is_agency_approved(p.agency_id)
     ) then
    raise exception 'Invalid or unapproved package/agency';
  end if;
  return new;
end;
$function$;

drop trigger if exists guard_booking_insert on public.bookings;
create trigger guard_booking_insert before insert on public.bookings
for each row execute function public.guard_booking_insert();
revoke all on function public.guard_booking_insert() from public, anon, authenticated;

create or replace function public.guard_hotel_booking_insert()
returns trigger language plpgsql security definer set search_path = ''
as $function$
declare
  v_price numeric; v_room_type text; v_hotel_name text; v_city text; v_address text;
  v_available integer; v_nights integer; v_subtotal numeric;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if new.customer_id is distinct from (select auth.uid()) then
    raise exception 'Booking customer must match the authenticated user';
  end if;
  if new.booking_status is distinct from 'pending'
     or new.payment_status is distinct from 'unpaid' then
    raise exception 'New hotel bookings must start pending and unpaid';
  end if;
  if new.room_category_id is null or new.rooms_booked is null or new.rooms_booked < 1 then
    raise exception 'A valid room category and room count are required';
  end if;
  if new.check_in_date is null or new.check_out_date is null
     or new.check_in_date < current_date
     or new.check_out_date <= new.check_in_date
     or new.check_out_date > current_date + 7 then
    raise exception 'Invalid hotel booking dates';
  end if;

  select rc.price_per_night, rc.room_type, rc.available_rooms,
         h.hotel_name, h.city, h.address
    into v_price, v_room_type, v_available, v_hotel_name, v_city, v_address
  from public.room_categories rc
  join public.hotels h on h.hotel_id = rc.hotel_id
  where rc.id = new.room_category_id
    and h.status = 'active'
    and coalesce(h.hide_from_search, false) = false
  for update of rc;

  if not found then raise exception 'Hotel room category is not currently bookable'; end if;
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

drop trigger if exists guard_hotel_booking_insert on public.hotel_bookings;
create trigger guard_hotel_booking_insert before insert on public.hotel_bookings
for each row execute function public.guard_hotel_booking_insert();
revoke all on function public.guard_hotel_booking_insert() from public, anon, authenticated;

create or replace function public.guard_hotel_booking_mutation()
returns trigger language plpgsql security definer set search_path = ''
as $function$
declare uid uuid := (select auth.uid()); owner_id uuid;
begin
  if uid is null then raise exception 'Authentication required'; end if;

  select h.owner_id into owner_id
  from public.room_categories rc
  join public.hotels h on h.hotel_id = rc.hotel_id
  where rc.id = old.room_category_id;

  if uid = old.customer_id then
    if new.customer_id is distinct from old.customer_id
       or new.room_category_id is distinct from old.room_category_id
       or new.hotel_name is distinct from old.hotel_name
       or new.room_type is distinct from old.room_type
       or new.location is distinct from old.location
       or new.check_in_date is distinct from old.check_in_date
       or new.check_out_date is distinct from old.check_out_date
       or new.rooms_booked is distinct from old.rooms_booked
       or new.price_per_night is distinct from old.price_per_night
       or new.total_nights is distinct from old.total_nights
       or new.subtotal_amount is distinct from old.subtotal_amount
       or new.gateway_fee is distinct from old.gateway_fee
       or new.service_fee is distinct from old.service_fee
       or new.total_amount is distinct from old.total_amount
       or new.cancellation_policy_agreed is distinct from old.cancellation_policy_agreed
       or new.customer_email is distinct from old.customer_email
       or new.customer_phone is distinct from old.customer_phone
       or new.payment_contact_number is distinct from old.payment_contact_number
       or new.payment_instructions is distinct from old.payment_instructions
       or new.approved_at is distinct from old.approved_at
       or new.denied_at is distinct from old.denied_at then
      raise exception 'Customers cannot modify protected hotel booking fields';
    end if;

    if new.booking_status is distinct from old.booking_status then
      if new.booking_status = 'confirmed' and old.booking_status not in ('approved','confirmed') then
        raise exception 'Hotel booking can be confirmed only after approval';
      end if;
      if new.booking_status = 'cancelled' and old.booking_status not in ('pending','approved','confirmed') then
        raise exception 'Hotel booking cannot be cancelled from its current state';
      end if;
      if new.booking_status not in ('cancelled','confirmed') then
        raise exception 'Invalid customer hotel booking status transition';
      end if;
    end if;

    if new.payment_status is distinct from old.payment_status
       and not (new.payment_status = 'paid' and old.booking_status in ('approved','confirmed')) then
      raise exception 'Invalid customer hotel payment status transition';
    end if;

  elsif uid = owner_id then
    if new.customer_id is distinct from old.customer_id
       or new.room_category_id is distinct from old.room_category_id
       or new.hotel_name is distinct from old.hotel_name
       or new.room_type is distinct from old.room_type
       or new.location is distinct from old.location
       or new.check_in_date is distinct from old.check_in_date
       or new.check_out_date is distinct from old.check_out_date
       or new.rooms_booked is distinct from old.rooms_booked
       or new.price_per_night is distinct from old.price_per_night
       or new.total_nights is distinct from old.total_nights
       or new.subtotal_amount is distinct from old.subtotal_amount
       or new.gateway_fee is distinct from old.gateway_fee
       or new.service_fee is distinct from old.service_fee
       or new.total_amount is distinct from old.total_amount
       or new.cancellation_policy_agreed is distinct from old.cancellation_policy_agreed
       or new.customer_email is distinct from old.customer_email
       or new.customer_phone is distinct from old.customer_phone
       or new.payment_status is distinct from old.payment_status then
      raise exception 'Hotel owners cannot modify protected hotel booking fields';
    end if;

    if new.booking_status is distinct from old.booking_status
       and not (old.booking_status = 'pending' and new.booking_status in ('approved','denied')) then
      raise exception 'Invalid hotel owner booking status transition';
    end if;
  else
    raise exception 'You are not allowed to modify this hotel booking';
  end if;

  return new;
end;
$function$;

revoke all on function public.guard_hotel_booking_mutation() from public, anon, authenticated;
