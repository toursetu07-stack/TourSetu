-- Restores the taxi schema migration that was applied to the hosted project.
-- Safe to replay: tables/columns/indexes are guarded and policies are replaced by name.
CREATE TABLE IF NOT EXISTS public.driver_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.driver_profiles(user_id) ON DELETE CASCADE,
  vehicle_type text NOT NULL,
  make_model text NOT NULL,
  registration_number text NOT NULL,
  seating_capacity integer NOT NULL CHECK (seating_capacity BETWEEN 1 AND 100),
  price_per_km numeric NOT NULL CHECK (price_per_km >= 0),
  rc_document_path text NOT NULL,
  permit_document_path text,
  insurance_document_path text NOT NULL,
  fitness_document_path text,
  puc_document_path text,
  vehicle_photo_path text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  driver_name text,
  driver_city text
);
CREATE TABLE IF NOT EXISTS public.driver_service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES public.driver_profiles(user_id) ON DELETE CASCADE,
  request_group_id uuid NOT NULL DEFAULT gen_random_uuid(),
  trip_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','denied','cancelled')),
  driver_response_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  vehicle_id uuid
);
ALTER TABLE public.driver_vehicles
  ADD COLUMN IF NOT EXISTS driver_name text,
  ADD COLUMN IF NOT EXISTS driver_city text,
  ADD COLUMN IF NOT EXISTS vehicle_photo_path text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE public.driver_service_requests
  ADD COLUMN IF NOT EXISTS request_group_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS trip_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS driver_response_at timestamptz,
  ADD COLUMN IF NOT EXISTS vehicle_id uuid;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='driver_service_requests_vehicle_id_fkey' AND conrelid='public.driver_service_requests'::regclass) THEN
    ALTER TABLE public.driver_service_requests ADD CONSTRAINT driver_service_requests_vehicle_id_fkey
      FOREIGN KEY (vehicle_id) REFERENCES public.driver_vehicles(id) ON DELETE SET NULL;
  END IF;
END $$;
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_service_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "driver owner admin can view own vehicles" ON public.driver_vehicles;
CREATE POLICY "driver owner admin can view own vehicles" ON public.driver_vehicles FOR SELECT TO authenticated
  USING (driver_id = (SELECT auth.uid()) OR is_toursetu_admin());
DROP POLICY IF EXISTS "public can view active driver vehicles" ON public.driver_vehicles;
CREATE POLICY "public can view active driver vehicles" ON public.driver_vehicles FOR SELECT TO anon, authenticated
  USING (status = 'active');
DROP POLICY IF EXISTS "driver owner can publish vehicles" ON public.driver_vehicles;
CREATE POLICY "driver owner can publish vehicles" ON public.driver_vehicles FOR INSERT TO authenticated
  WITH CHECK (driver_id = (SELECT auth.uid()) AND EXISTS (
    SELECT 1 FROM public.driver_profiles dp WHERE dp.user_id = (SELECT auth.uid())
  ));
DROP POLICY IF EXISTS "driver owner can update own vehicles" ON public.driver_vehicles;
CREATE POLICY "driver owner can update own vehicles" ON public.driver_vehicles FOR UPDATE TO authenticated
  USING (driver_id = (SELECT auth.uid()) OR is_toursetu_admin())
  WITH CHECK (driver_id = (SELECT auth.uid()) OR is_toursetu_admin());
DROP POLICY IF EXISTS "driver owner can delete own vehicles" ON public.driver_vehicles;
CREATE POLICY "driver owner can delete own vehicles" ON public.driver_vehicles FOR DELETE TO authenticated
  USING (driver_id = (SELECT auth.uid()) OR is_toursetu_admin());
DROP POLICY IF EXISTS "request parties can read taxi requests" ON public.driver_service_requests;
CREATE POLICY "request parties can read taxi requests" ON public.driver_service_requests FOR SELECT TO authenticated
  USING (customer_id = (SELECT auth.uid()) OR driver_id = (SELECT auth.uid()) OR is_toursetu_admin());
DROP POLICY IF EXISTS "customer create request for active taxi vehicle" ON public.driver_service_requests;
CREATE POLICY "customer create request for active taxi vehicle" ON public.driver_service_requests FOR INSERT TO authenticated
  WITH CHECK (customer_id = (SELECT auth.uid()) AND status = 'pending' AND EXISTS (
    SELECT 1 FROM public.driver_vehicles v
    WHERE v.id = vehicle_id AND v.driver_id = driver_id AND v.status = 'active'
  ));
DROP POLICY IF EXISTS "driver can approve or deny own pending request" ON public.driver_service_requests;
CREATE POLICY "driver can approve or deny own pending request" ON public.driver_service_requests FOR UPDATE TO authenticated
  USING (driver_id = (SELECT auth.uid()) AND status = 'pending')
  WITH CHECK (driver_id = (SELECT auth.uid()) AND status IN ('approved','denied'));
DROP POLICY IF EXISTS "customer can cancel own pending or approved request" ON public.driver_service_requests;
CREATE POLICY "customer can cancel own pending or approved request" ON public.driver_service_requests FOR UPDATE TO authenticated
  USING (customer_id = (SELECT auth.uid()) AND status IN ('pending','approved'))
  WITH CHECK (customer_id = (SELECT auth.uid()) AND status = 'cancelled');
GRANT SELECT, INSERT, UPDATE, DELETE ON public.driver_vehicles TO authenticated;
REVOKE ALL ON public.driver_vehicles FROM anon;
GRANT SELECT (id, driver_id, vehicle_type, make_model, seating_capacity, price_per_km,
              vehicle_photo_path, status, created_at, driver_name, driver_city)
  ON public.driver_vehicles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.driver_service_requests TO authenticated;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='driver_vehicles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_vehicles;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='driver_service_requests') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_service_requests;
  END IF;
END $$;
