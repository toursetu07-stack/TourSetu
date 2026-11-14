-- Add driver vehicle route fields without changing existing records.
ALTER TABLE public.driver_vehicles
  ADD COLUMN IF NOT EXISTS starting_location text,
  ADD COLUMN IF NOT EXISTS tour_destination text[] NOT NULL DEFAULT '{}'::text[];

-- Keep the public view narrow: verification document paths remain private.
CREATE OR REPLACE VIEW public.active_driver_vehicles
WITH (security_barrier = true)
AS
SELECT id,driver_id,vehicle_type,make_model,seating_capacity,price_per_km,
       vehicle_photo_path,status,created_at,driver_name,driver_city,
       registration_number,starting_location,tour_destination
FROM public.driver_vehicles;

REVOKE ALL ON TABLE public.active_driver_vehicles FROM PUBLIC;
GRANT SELECT ON TABLE public.active_driver_vehicles TO anon, authenticated;
