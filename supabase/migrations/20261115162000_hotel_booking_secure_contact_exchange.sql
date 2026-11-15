-- Secure two-way contact exchange for Registered Hotel bookings.
-- Contact numbers are stored outside the RLS-readable booking row and are
-- returned only to the booking customer / owning hotel after owner approval.

create table if not exists private.hotel_booking_contacts (
    booking_id uuid primary key references public.hotel_bookings(id) on delete cascade,
    customer_phone text,
    owner_phone text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table private.hotel_booking_contacts enable row level security;
revoke all on table private.hotel_booking_contacts from public, anon, authenticated;
grant all on table private.hotel_booking_contacts to service_role;

-- Move any existing customer numbers out of the public booking row.
insert into private.hotel_booking_contacts (booking_id, customer_phone)
select id, nullif(btrim(customer_phone), '')
from public.hotel_bookings
where nullif(btrim(customer_phone), '') is not null
on conflict (booking_id) do update
set customer_phone = coalesce(private.hotel_booking_contacts.customer_phone, excluded.customer_phone),
    updated_at = now();

update public.hotel_bookings
set customer_phone = null
where customer_phone is not null;

create or replace function private.capture_hotel_booking_customer_contact()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
    phone_digits text;
begin
    phone_digits := regexp_replace(coalesce(new.customer_phone, ''), '[^0-9]', '', 'g');
    if length(phone_digits) < 8 or length(phone_digits) > 15 then
        raise exception 'A valid customer phone number (8–15 digits) is required';
    end if;

    insert into private.hotel_booking_contacts (booking_id, customer_phone)
    values (new.id, btrim(new.customer_phone))
    on conflict (booking_id) do update
      set customer_phone = excluded.customer_phone,
          updated_at = now();

    new.customer_phone := null;
    return new;
end;
$function$;

revoke all on function private.capture_hotel_booking_customer_contact() from public, anon, authenticated;

drop trigger if exists capture_hotel_booking_customer_contact on public.hotel_bookings;
create trigger capture_hotel_booking_customer_contact
before insert on public.hotel_bookings
for each row execute function private.capture_hotel_booking_customer_contact();

-- An owner cannot bypass the approval RPC by directly changing booking_status.
create or replace function private.require_hotel_contact_before_approval()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
    if old.booking_status = 'pending' and new.booking_status = 'approved' then
        if not exists (
            select 1
            from private.hotel_booking_contacts c
            where c.booking_id = old.id
              and nullif(btrim(c.owner_phone), '') is not null
              and nullif(btrim(c.customer_phone), '') is not null
        ) then
            raise exception 'Hotel contact exchange must be completed through the secure approval workflow';
        end if;
    end if;
    return new;
end;
$function$;

revoke all on function private.require_hotel_contact_before_approval() from public, anon, authenticated;

drop trigger if exists require_hotel_contact_before_approval on public.hotel_bookings;
create trigger require_hotel_contact_before_approval
before update of booking_status on public.hotel_bookings
for each row execute function private.require_hotel_contact_before_approval();

create or replace function public.approve_hotel_booking_with_contact(
    p_booking_id uuid,
    p_owner_phone text,
    p_payment_contact_number text,
    p_payment_instructions text
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
    uid uuid := (select auth.uid());
    v_customer_id uuid;
    v_owner_id uuid;
    v_status text;
    v_owner_digits text;
begin
    if uid is null then
        raise exception 'Authentication required';
    end if;

    v_owner_digits := regexp_replace(coalesce(p_owner_phone, ''), '[^0-9]', '', 'g');
    if length(v_owner_digits) < 8 or length(v_owner_digits) > 15 then
        raise exception 'A valid hotel contact number (8–15 digits) is required';
    end if;

    select hb.customer_id, h.owner_id, hb.booking_status
      into v_customer_id, v_owner_id, v_status
    from public.hotel_bookings hb
    join public.room_categories rc on rc.id = hb.room_category_id
    join public.hotels h on h.hotel_id = rc.hotel_id
    where hb.id = p_booking_id
    for update of hb;

    if not found or v_owner_id is distinct from uid then
        raise exception 'You are not authorized to approve this hotel booking';
    end if;

    if v_status <> 'pending' then
        raise exception 'Only pending hotel bookings can be approved';
    end if;

    if not exists (
        select 1 from private.hotel_booking_contacts c
        where c.booking_id = p_booking_id
          and nullif(btrim(c.customer_phone), '') is not null
    ) then
        raise exception 'Customer contact number is missing; ask the customer to submit a valid number';
    end if;

    update private.hotel_booking_contacts
       set owner_phone = btrim(p_owner_phone),
           updated_at = now()
     where booking_id = p_booking_id;

    update public.hotel_bookings
       set booking_status = 'approved',
           payment_status = 'unpaid',
           payment_contact_number = nullif(btrim(p_payment_contact_number), ''),
           payment_instructions = nullif(btrim(p_payment_instructions), ''),
           owner_message = 'Request accepted. Your hotel contact details are now shared securely.',
           approved_at = now(),
           denied_at = null,
           cancellation_reason = null
     where id = p_booking_id;
end;
$function$;

revoke all on function public.approve_hotel_booking_with_contact(uuid, text, text, text) from public, anon;
grant execute on function public.approve_hotel_booking_with_contact(uuid, text, text, text) to authenticated;

create or replace function public.get_hotel_booking_contacts(p_booking_id uuid)
returns table (
    is_shared boolean,
    customer_phone text,
    owner_phone text
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
    uid uuid := (select auth.uid());
begin
    if uid is null then
        raise exception 'Authentication required';
    end if;

    return query
    select
        (
            hb.booking_status in ('approved', 'confirmed')
            and nullif(btrim(c.customer_phone), '') is not null
            and nullif(btrim(c.owner_phone), '') is not null
        ) as is_shared,
        case
            when hb.booking_status in ('approved', 'confirmed')
             and nullif(btrim(c.customer_phone), '') is not null
             and nullif(btrim(c.owner_phone), '') is not null
            then c.customer_phone else null
        end as customer_phone,
        case
            when hb.booking_status in ('approved', 'confirmed')
             and nullif(btrim(c.customer_phone), '') is not null
             and nullif(btrim(c.owner_phone), '') is not null
            then c.owner_phone else null
        end as owner_phone
    from public.hotel_bookings hb
    join public.room_categories rc on rc.id = hb.room_category_id
    join public.hotels h on h.hotel_id = rc.hotel_id
    left join private.hotel_booking_contacts c on c.booking_id = hb.id
    where hb.id = p_booking_id
      and (hb.customer_id = uid or h.owner_id = uid);
end;
$function$;

revoke all on function public.get_hotel_booking_contacts(uuid) from public, anon;
grant execute on function public.get_hotel_booking_contacts(uuid) to authenticated;
