-- Step 2 security hardening: owner-scoped taxi contacts and read-only service catalog.
-- private.hotel_booking_contacts is intentionally unchanged; its existing RPC/trigger
-- flow remains the only access path.

ALTER TABLE public.driver_service_request_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "request parties can read taxi contact details"
  ON public.driver_service_request_contacts;
CREATE POLICY "request parties can read taxi contact details"
  ON public.driver_service_request_contacts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.driver_service_requests r
      WHERE r.id = request_id
        AND (r.customer_id = (SELECT auth.uid())
          OR r.driver_id = (SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS "request parties can insert taxi contact details"
  ON public.driver_service_request_contacts;
CREATE POLICY "request parties can insert taxi contact details"
  ON public.driver_service_request_contacts
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.driver_service_requests r
      WHERE r.id = request_id
        AND (r.customer_id = (SELECT auth.uid())
          OR r.driver_id = (SELECT auth.uid()))
    )
  );

-- Keep direct client INSERT disabled: the existing trusted RPC/trigger workflow
-- writes this sensitive two-party contact row. The INSERT policy is defense in
-- depth for a future explicitly granted flow; no client INSERT privilege is given.
REVOKE ALL ON TABLE public.driver_service_request_contacts FROM anon, authenticated;
GRANT SELECT ON TABLE public.driver_service_request_contacts TO authenticated;

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can read service catalog"
  ON public.services;
CREATE POLICY "public can read service catalog"
  ON public.services
  FOR SELECT TO anon, authenticated
  USING (true);

-- Catalog is public read-only for browser roles. Trusted service_role/postgres
-- workflows retain their existing privileges.
REVOKE ALL ON TABLE public.services FROM anon, authenticated;
GRANT SELECT ON TABLE public.services TO anon, authenticated;
