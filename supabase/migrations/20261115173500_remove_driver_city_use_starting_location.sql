-- Use vehicle starting_location as the only taxi-listing city source.
-- Remove the obsolete profile city and per-vehicle driver_city fields.
begin;
set local lock_timeout = '5s';

drop view if exists public.active_driver_vehicles;

create or replace function public.create_driver_profile_on_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.raw_user_meta_data->>'role', '') = 'driver' then
    insert into public.driver_profiles(user_id, full_name, phone, email, status)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', 'Driver'),
      coalesce(new.raw_user_meta_data->>'phone', ''),
      coalesce(new.email, ''),
      'pending'
    )
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

alter table public.driver_profiles drop column if exists city;
alter table public.driver_vehicles drop column if exists driver_city;

-- Remove the obsolete city snapshot from historical taxi request JSON.
update public.driver_service_requests
set trip_details = trip_details - 'driver_city'
where trip_details ? 'driver_city';

create view public.active_driver_vehicles
with (security_invoker = true, security_barrier = true)
as
select
  id,
  driver_id,
  vehicle_type,
  make_model,
  seating_capacity,
  price_per_km,
  vehicle_photo_path,
  status,
  created_at,
  driver_name,
  registration_number,
  starting_location,
  tour_destination,
  fixed_package_price
from public.driver_vehicles;

revoke all on table public.active_driver_vehicles from public;
grant select on table public.active_driver_vehicles to anon, authenticated;

commit;
