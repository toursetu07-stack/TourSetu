-- Support per-kilometre and fixed-package pricing for independent driver vehicles.
ALTER TABLE public.driver_vehicles
  ADD COLUMN IF NOT EXISTS fixed_package_price numeric(12,2);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'driver_vehicles_fixed_package_price_positive'
      AND conrelid = 'public.driver_vehicles'::regclass
  ) THEN
    ALTER TABLE public.driver_vehicles
      ADD CONSTRAINT driver_vehicles_fixed_package_price_positive
      CHECK (fixed_package_price IS NULL OR fixed_package_price > 0);
  END IF;
END
$;

-- The invoker-secured public view needs an explicit column-level grant.
GRANT SELECT (fixed_package_price) ON public.driver_vehicles TO anon, authenticated;

-- Keep the existing public listing view invoker-secured and expose only the
-- explicitly approved vehicle fields plus the optional package price.
CREATE OR REPLACE VIEW public.active_driver_vehicles
WITH (security_invoker = true, security_barrier = true)
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
  registration_number,
  starting_location,
  tour_destination,
  fixed_package_price
FROM public.driver_vehicles;
