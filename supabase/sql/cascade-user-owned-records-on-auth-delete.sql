-- TourSetu: cascade all user-owned relational data when auth.users is deleted.
-- Storage objects are intentionally NOT modified here. Supabase requires Storage API
-- deletion for actual files; deleting storage.objects rows directly creates orphaned files.

ALTER TABLE public.agency_profiles
  DROP CONSTRAINT IF EXISTS agency_profiles_id_fkey;
ALTER TABLE public.agency_profiles
  ADD CONSTRAINT agency_profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.hotels
  DROP CONSTRAINT IF EXISTS hotels_owner_id_fkey;
ALTER TABLE public.hotels
  ADD CONSTRAINT hotels_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.agency_verification_requests
  DROP CONSTRAINT IF EXISTS agency_verification_requests_reviewed_by_fkey;
ALTER TABLE public.agency_verification_requests
  ADD CONSTRAINT agency_verification_requests_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.hotel_bookings
  DROP CONSTRAINT IF EXISTS hotel_bookings_customer_id_fkey;
ALTER TABLE public.hotel_bookings
  ADD CONSTRAINT hotel_bookings_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.hotel_bookings
  DROP CONSTRAINT IF EXISTS hotel_bookings_room_category_id_fkey;
ALTER TABLE public.hotel_bookings
  ADD CONSTRAINT hotel_bookings_room_category_id_fkey
  FOREIGN KEY (room_category_id) REFERENCES public.room_categories(id) ON DELETE CASCADE;

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_customer_id_fkey;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Legacy data currently contains 56 agency_id values with no matching auth user.
-- NOT VALID preserves that legacy data while enforcing the relationship for new rows
-- and applying ON DELETE CASCADE for valid future relationships.
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_agency_id_fkey;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_agency_id_fkey
  FOREIGN KEY (agency_id) REFERENCES auth.users(id) ON DELETE CASCADE
  NOT VALID;

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_hotel_id_fkey;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_hotel_id_fkey
  FOREIGN KEY (hotel_id) REFERENCES public.hotels(hotel_id) ON DELETE CASCADE;

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_room_category_id_fkey;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_room_category_id_fkey
  FOREIGN KEY (room_category_id) REFERENCES public.room_categories(id) ON DELETE CASCADE;

ALTER TABLE public.room_categories
  DROP CONSTRAINT IF EXISTS fk_hotels;
ALTER TABLE public.room_categories
  ADD CONSTRAINT fk_hotels
  FOREIGN KEY (hotel_id) REFERENCES public.hotels(hotel_id) ON DELETE CASCADE;

ALTER TABLE public.rooms
  DROP CONSTRAINT IF EXISTS rooms_hotel_id_fkey;
ALTER TABLE public.rooms
  ADD CONSTRAINT rooms_hotel_id_fkey
  FOREIGN KEY (hotel_id) REFERENCES public.hotels(hotel_id) ON DELETE CASCADE;
