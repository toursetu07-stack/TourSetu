-- TourSetu Security Audit Step 3
-- Pin callable SECURITY DEFINER RPCs to a trusted search path.
-- Their current bodies enforce auth.uid() ownership/party membership.

ALTER FUNCTION public.approve_hotel_booking_with_contact(uuid, text, text, text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.ensure_my_hotel_verification_request() SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_driver_service_request_contacts(uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_hotel_booking_contacts(uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_or_create_referral_code() SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_referral_dashboard_stats() SET search_path = pg_catalog, public;
ALTER FUNCTION public.record_referral_login(text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.respond_to_driver_service_request(uuid, text, text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.save_agency_verification_documents(text, text, text, text, text, text, text, text, text, text, text, text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.save_hotel_verification_documents(text, text, text, text, text) SET search_path = pg_catalog, public;

REVOKE ALL ON FUNCTION public.approve_hotel_booking_with_contact(uuid, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.ensure_my_hotel_verification_request() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_driver_service_request_contacts(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_hotel_booking_contacts(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_or_create_referral_code() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_referral_dashboard_stats() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.record_referral_login(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.respond_to_driver_service_request(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.save_agency_verification_documents(text, text, text, text, text, text, text, text, text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.save_hotel_verification_documents(text, text, text, text, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.approve_hotel_booking_with_contact(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_my_hotel_verification_request() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_driver_service_request_contacts(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_hotel_booking_contacts(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_referral_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_referral_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_referral_login(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_to_driver_service_request(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_agency_verification_documents(text, text, text, text, text, text, text, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_hotel_verification_documents(text, text, text, text, text) TO authenticated;

ALTER TABLE public.referral_login_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "referral participants can read own login events" ON public.referral_login_events;
CREATE POLICY "referral participants can read own login events"
ON public.referral_login_events FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = referrer_user_id OR (SELECT auth.uid()) = referred_user_id);
REVOKE ALL ON TABLE public.referral_login_events FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.referral_login_events FROM authenticated;
GRANT SELECT ON TABLE public.referral_login_events TO authenticated;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.public_hotel_inventory FROM anon, authenticated;
GRANT SELECT ON TABLE public.public_hotel_inventory TO anon, authenticated;
