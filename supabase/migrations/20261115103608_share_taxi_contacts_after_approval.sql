-- Independent taxi contacts are shared only after the assigned driver approves the request.
-- The contact table remains private; the authenticated RPC checks both request ownership and status.
drop function if exists public.get_driver_service_request_contacts(uuid);

create function public.get_driver_service_request_contacts(p_request_id uuid)
returns table(is_shared boolean, customer_phone text, driver_phone text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
  v_customer_id uuid;
  v_driver_id uuid;
  v_customer_phone text;
  v_driver_phone text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select r.status, r.customer_id, r.driver_id
    into v_status, v_customer_id, v_driver_id
  from public.driver_service_requests r
  where r.id = p_request_id
    and (r.customer_id = auth.uid() or r.driver_id = auth.uid());

  if not found then
    return;
  end if;

  if v_status = 'approved' then
    select c.customer_phone, c.driver_phone
      into v_customer_phone, v_driver_phone
    from public.driver_service_request_contacts c
    where c.request_id = p_request_id;

    if nullif(btrim(v_customer_phone), '') is not null
       and nullif(btrim(v_driver_phone), '') is not null then
      return query select true, v_customer_phone, v_driver_phone;
      return;
    end if;
  end if;

  return query select false, null::text, null::text;
end;
$$;

revoke all on function public.get_driver_service_request_contacts(uuid) from public, anon;
grant execute on function public.get_driver_service_request_contacts(uuid) to authenticated;

comment on function public.get_driver_service_request_contacts(uuid) is
  'Returns both parties'' phone numbers only to the request customer or assigned driver after status=approved and both numbers are present.';
