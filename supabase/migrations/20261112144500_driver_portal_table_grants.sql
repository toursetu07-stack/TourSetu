-- Expose driver portal tables to the authenticated Data API role.
-- RLS remains enabled; existing owner/admin policies continue to control row access.
grant select, insert, update on table public.driver_profiles to authenticated;
grant select, insert, update on table public.driver_vehicles to authenticated;
grant select on table public.driver_vehicles to anon;
grant select, insert, update on table public.driver_service_requests to authenticated;
