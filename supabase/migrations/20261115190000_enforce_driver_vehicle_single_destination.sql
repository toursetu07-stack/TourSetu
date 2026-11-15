-- Enforce exactly one non-empty destination for every new or updated driver vehicle.
-- Existing legacy rows are left intact; editing one in the workspace selects its first
-- saved destination and the next save normalizes that row to a single destination.
create or replace function public.enforce_driver_vehicle_single_destination()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.tour_destination is null
     or cardinality(new.tour_destination) <> 1
     or nullif(btrim(new.tour_destination[1]), '') is null then
    raise exception 'Select exactly one non-empty tour destination for this vehicle.'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists driver_vehicles_single_destination_guard on public.driver_vehicles;
create trigger driver_vehicles_single_destination_guard
before insert or update of tour_destination on public.driver_vehicles
for each row
execute function public.enforce_driver_vehicle_single_destination();
