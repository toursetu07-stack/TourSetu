-- Public listing view intentionally exposes only customer-safe vehicle fields.
CREATE OR REPLACE VIEW public.active_driver_vehicles
WITH (security_invoker=true, security_barrier=true)
AS
SELECT id, driver_id, vehicle_type, make_model, seating_capacity,
       price_per_km, vehicle_photo_path, status, created_at,
       driver_name, driver_city
FROM public.driver_vehicles
WHERE status = 'active';

GRANT SELECT ON public.active_driver_vehicles TO anon, authenticated;
