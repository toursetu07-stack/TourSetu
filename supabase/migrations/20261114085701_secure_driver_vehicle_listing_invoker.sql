-- Make the public vehicle listing view respect caller privileges and RLS.
-- Only explicitly public listing columns are readable by anon/authenticated.
DROP POLICY IF EXISTS "driver owner admin can view own vehicles" ON public.driver_vehicles;
DROP POLICY IF EXISTS "driver vehicles public listing select" ON public.driver_vehicles;
CREATE POLICY "driver vehicles public listing select"
  ON public.driver_vehicles
  FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT SELECT (
  id, driver_id, vehicle_type, make_model, registration_number,
  seating_capacity, price_per_km, vehicle_photo_path, status, created_at,
  driver_name, driver_city, starting_location, tour_destination
) ON public.driver_vehicles TO anon, authenticated;

CREATE OR REPLACE VIEW public.active_driver_vehicles
WITH (security_invoker = true, security_barrier = true)
AS
SELECT id,driver_id,vehicle_type,make_model,seating_capacity,price_per_km,
       vehicle_photo_path,status,created_at,driver_name,driver_city,
       registration_number,starting_location,tour_destination
FROM public.driver_vehicles;

REVOKE ALL ON TABLE public.active_driver_vehicles FROM PUBLIC;
GRANT SELECT ON TABLE public.active_driver_vehicles TO anon, authenticated;
