-- Secure independent taxi contact exchange. Contact details remain private until a trusted payment process marks the request paid.
alter table public.driver_service_requests
  add column if not exists payment_status text not null default 'unpaid'
  check (payment_status in ('unpaid','pending','paid','failed','refunded'));

comment on column public.driver_service_requests.payment_status is
  'Set to paid only by a trusted payment verification backend/webhook; never by an authenticated browser client.';

create table if not exists public.driver_service_request_contacts (
  request_id uuid primary key references public.driver_service_requests(id) on delete cascade,
  customer_phone text,
  driver_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.driver_service_request_contacts enable row level security;
revoke all on public.driver_service_request_contacts from anon, authenticated;
grant all on public.driver_service_request_contacts to service_role;

-- Move previously embedded customer numbers out of the party-readable trip_details JSON.
insert into public.driver_service_request_contacts(request_id, customer_phone)
select id, nullif(btrim(trip_details->>'customer_phone'), '')
from public.driver_service_requests
where nullif(btrim(trip_details->>'customer_phone'), '') is not null
on conflict (request_id) do update
set customer_phone = coalesce(excluded.customer_phone, public.driver_service_request_contacts.customer_phone),
    updated_at = now();

update public.driver_service_requests
set trip_details = trip_details - 'customer_phone'
where trip_details ? 'customer_phone';

create or replace function public.capture_driver_service_request_customer_phone()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_phone text;
begin
  v_phone := nullif(btrim(new.trip_details->>'customer_phone'), '');
  insert into public.driver_service_request_contacts(request_id, customer_phone)
  values (new.id, v_phone)
  on conflict (request_id) do update
    set customer_phone = coalesce(excluded.customer_phone, public.driver_service_request_contacts.customer_phone),
        updated_at = now();

  if new.trip_details ? 'customer_phone' then
    update public.driver_service_requests
       set trip_details = trip_details - 'customer_phone'
     where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists capture_driver_service_request_customer_phone on public.driver_service_requests;
create trigger capture_driver_service_request_customer_phone
after insert on public.driver_service_requests
for each row execute function public.capture_driver_service_request_customer_phone();

-- Prevent a browser client from asserting payment success while creating a request.
revoke insert on public.driver_service_requests from authenticated;
grant insert (customer_id, driver_id, vehicle_id, status, trip_details)
  on public.driver_service_requests to authenticated;

-- The browser may cancel its own request via the existing RLS policy, but cannot directly alter
-- payment_status or approve a request without using the validated driver RPC below.
drop policy if exists "driver can approve or deny own pending request" on public.driver_service_requests;
revoke update on public.driver_service_requests from authenticated;
grant update (status) on public.driver_service_requests to authenticated;
grant select on public.driver_service_requests to authenticated;

create or replace function public.respond_to_driver_service_request(
  p_request_id uuid,
  p_status text,
  p_driver_phone text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_driver_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if p_status is null or p_status not in ('approved','denied') then
    raise exception 'Unsupported driver response';
  end if;
  if p_status = 'approved' and (
    p_driver_phone is null
    or length(regexp_replace(p_driver_phone, '[^0-9]', '', 'g')) not between 7 and 15
  ) then
    raise exception 'Enter a valid driver contact number';
  end if;

  select driver_id into v_driver_id
  from public.driver_service_requests
  where id = p_request_id and driver_id = auth.uid() and status = 'pending'
  for update;

  if not found then
    raise exception 'This request is no longer pending or does not belong to this driver';
  end if;

  update public.driver_service_requests
     set status = p_status,
         driver_response_at = now()
   where id = p_request_id;

  if p_status = 'approved' then
    insert into public.driver_service_request_contacts(request_id, driver_phone)
    values (p_request_id, btrim(p_driver_phone))
    on conflict (request_id) do update
      set driver_phone = excluded.driver_phone, updated_at = now();
  end if;
end;
$$;

create or replace function public.get_driver_service_request_contacts(p_request_id uuid)
returns table(is_paid boolean, customer_phone text, driver_phone text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_payment_status text;
  v_customer_id uuid;
  v_driver_id uuid;
  v_customer_phone text;
  v_driver_phone text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select r.payment_status, r.customer_id, r.driver_id
    into v_payment_status, v_customer_id, v_driver_id
  from public.driver_service_requests r
  where r.id = p_request_id
    and (r.customer_id = auth.uid() or r.driver_id = auth.uid());

  if not found then
    return;
  end if;

  if v_payment_status in ('paid') then
    select c.customer_phone, c.driver_phone
      into v_customer_phone, v_driver_phone
    from public.driver_service_request_contacts c
    where c.request_id = p_request_id;
    return query select true, v_customer_phone, v_driver_phone;
  else
    return query select false, null::text, null::text;
  end if;
end;
$$;

revoke all on function public.respond_to_driver_service_request(uuid,text,text) from public, anon;
grant execute on function public.respond_to_driver_service_request(uuid,text,text) to authenticated;
revoke all on function public.get_driver_service_request_contacts(uuid) from public, anon;
grant execute on function public.get_driver_service_request_contacts(uuid) to authenticated;
revoke all on function public.capture_driver_service_request_customer_phone() from public, anon, authenticated;

create index if not exists driver_service_requests_payment_status_idx
  on public.driver_service_requests(payment_status, created_at desc);
