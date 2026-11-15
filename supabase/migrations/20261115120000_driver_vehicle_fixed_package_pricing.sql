-- Support both driver per-kilometre and fixed package pricing.
ALTER TABLE public.driver_vehicles
  ADD COLUMN IF NOT EXISTS fixed_package_price numeric(12,2);

COMMENT ON COLUMN public.driver_vehicles.fixed_package_price IS
  'Optional driver-configured flat fare for the vehicle listing and its selected tour destinations.';

CREATE OR REPLACE VIEW public.active_driver_vehicles
WITH (security_invoker = true)
AS
SELECT id, driver_id, vehicle_type, make_model, seating_capacity,
       price_per_km, vehicle_photo_path, status, created_at, driver_name,
       driver_city, registration_number, starting_location, tour_destination,
       fixed_package_price
FROM public.driver_vehicles;

CREATE OR REPLACE FUNCTION public.set_driver_service_request_pricing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_rate numeric(12,2);
  v_fixed numeric(12,2);
  v_time text;
  v_date text;
BEGIN
  SELECT price_per_km, fixed_package_price INTO v_rate, v_fixed
  FROM public.driver_vehicles
  WHERE id = NEW.vehicle_id AND driver_id = NEW.driver_id AND status = 'active';
  IF NOT FOUND THEN RAISE EXCEPTION 'Selected taxi is no longer available.'; END IF;
  IF COALESCE(v_fixed, 0) <= 0 AND COALESCE(v_rate, 0) <= 0 THEN
    RAISE EXCEPTION 'The selected driver has not configured a valid fare.';
  END IF;
  v_date := NULLIF(NEW.trip_details->>'travel_date', '');
  v_time := NULLIF(NEW.trip_details->>'pickup_time_24h', '');
  IF v_date IS NULL OR v_time IS NULL OR v_time !~ '^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$' THEN
    RAISE EXCEPTION 'A valid pickup date and time are required.';
  END IF;
  NEW.trip_details := NEW.trip_details || jsonb_build_object(
    'pricing_model', CASE WHEN COALESCE(v_fixed, 0) > 0 THEN 'fixed_package' ELSE 'per_km' END,
    'price_per_km', CASE WHEN COALESCE(v_rate, 0) > 0 THEN v_rate ELSE NULL END,
    'fixed_package_price', CASE WHEN COALESCE(v_fixed, 0) > 0 THEN v_fixed ELSE NULL END,
    'fare_estimate', CASE WHEN COALESCE(v_fixed, 0) > 0 THEN v_fixed ELSE NULL END,
    'pickup_datetime_local', v_date || 'T' || v_time
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_driver_service_request_pricing ON public.driver_service_requests;
CREATE TRIGGER trg_driver_service_request_pricing
BEFORE INSERT ON public.driver_service_requests
FOR EACH ROW EXECUTE FUNCTION public.set_driver_service_request_pricing();
