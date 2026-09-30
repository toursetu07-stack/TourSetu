-- TourSetu: Customer Pickup Distance Pricing
-- Run this once in Supabase SQL Editor.

-- 1) Agency package: amount charged per km for pickup distance.
ALTER TABLE public.packages
ADD COLUMN IF NOT EXISTS pickup_km_rate numeric(10,2) NOT NULL DEFAULT 0;

ALTER TABLE public.packages
DROP CONSTRAINT IF EXISTS packages_pickup_km_rate_nonnegative;

ALTER TABLE public.packages
ADD CONSTRAINT packages_pickup_km_rate_nonnegative
CHECK (pickup_km_rate >= 0);

-- 2) Booking snapshot: keep the rate/distance/charge used at booking time.
-- This prevents a later agency rate change from changing an old booking's price.
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS pickup_km_rate numeric(10,2) NOT NULL DEFAULT 0;

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS pickup_distance_km numeric(10,2) NOT NULL DEFAULT 0;

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS pickup_distance_charge numeric(12,2) NOT NULL DEFAULT 0;

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS pickup_distance_origin text;

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS pickup_distance_destination text;

ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_pickup_km_rate_nonnegative;

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_pickup_km_rate_nonnegative
CHECK (pickup_km_rate >= 0);

ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_pickup_distance_km_nonnegative;

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_pickup_distance_km_nonnegative
CHECK (pickup_distance_km >= 0);

ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_pickup_distance_charge_nonnegative;

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_pickup_distance_charge_nonnegative
CHECK (pickup_distance_charge >= 0);

-- Optional verification:
-- SELECT id, title, starting_location, pickup_km_rate
-- FROM public.packages
-- ORDER BY created_at DESC
-- LIMIT 20;
