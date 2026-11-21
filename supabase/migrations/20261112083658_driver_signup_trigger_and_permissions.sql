-- Create a pending driver application at auth signup so email-confirmation flows can finish KYC after login.
create or replace function public.create_driver_profile_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if coalesce(new.raw_user_meta_data->>'role','') = 'driver' then
    insert into public.driver_profiles(user_id,full_name,phone,email,city,status)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name','Driver'),
      coalesce(new.raw_user_meta_data->>'phone',''),
      coalesce(new.email,''),
      nullif(new.raw_user_meta_data->>'city',''),
      'pending'
    )
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;
drop trigger if exists trg_create_driver_profile_on_signup on auth.users;
create trigger trg_create_driver_profile_on_signup
after insert on auth.users
for each row execute function public.create_driver_profile_on_signup();

-- Drivers may submit vehicle data while pending; customer visibility remains approved-only.
drop policy if exists "driver vehicle owner insert" on public.driver_vehicles;
create policy "driver vehicle owner insert" on public.driver_vehicles for insert to authenticated
with check (driver_id = auth.uid() and exists (
  select 1 from public.driver_profiles dp where dp.user_id = auth.uid() and dp.status in ('pending','approved')
));
-- Limit driver decisions to the two response columns.
revoke update on public.driver_service_requests from authenticated;
grant update(status,driver_response_at) on public.driver_service_requests to authenticated;
