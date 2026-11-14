-- Publish every saved independent taxi vehicle through a narrow public listing view.
-- Do not grant public access to driver KYC, RC, permit, insurance or other document paths.
DROP POLICY IF EXISTS "public can view active driver vehicles" ON public.driver_vehicles;
REVOKE SELECT ON TABLE public.driver_vehicles FROM anon;

CREATE OR REPLACE VIEW public.active_driver_vehicles
WITH (security_barrier = true)
AS
SELECT
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
  driver_city,
  registration_number
FROM public.driver_vehicles;

REVOKE ALL ON TABLE public.active_driver_vehicles FROM PUBLIC;
GRANT SELECT ON TABLE public.active_driver_vehicles TO anon, authenticated;
