-- Fix hotel contact FK ordering.
-- The booking row must exist before its private contact row is inserted.
-- Keep both writes in the same transaction via an AFTER INSERT trigger.

create or replace function private.capture_hotel_booking_customer_contact()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
    phone_digits text;
begin
    if nullif(btrim(new.customer_phone), '') is null then
        return new;
    end if;

    phone_digits := regexp_replace(new.customer_phone, '[^0-9]', '', 'g');
    if length(phone_digits) < 8 or length(phone_digits) > 15 then
        raise exception 'A valid customer phone number (8–15 digits) is required';
    end if;

    -- AFTER INSERT guarantees public.hotel_bookings.id already exists,
    -- so this FK reference is valid.
    insert into private.hotel_booking_contacts (booking_id, customer_phone)
    values (new.id, btrim(new.customer_phone))
    on conflict (booking_id) do update
      set customer_phone = excluded.customer_phone,
          updated_at = now();

    -- Remove the phone from the exposed booking row before the transaction
    -- commits. The insert and cleanup are atomic with the booking creation.
    update public.hotel_bookings
       set customer_phone = null
     where id = new.id
       and customer_phone is not null;

    return null;
end;
$function$;

revoke all on function private.capture_hotel_booking_customer_contact() from public, anon, authenticated;

drop trigger if exists capture_hotel_booking_customer_contact on public.hotel_bookings;
create trigger capture_hotel_booking_customer_contact
after insert on public.hotel_bookings
for each row execute function private.capture_hotel_booking_customer_contact();
