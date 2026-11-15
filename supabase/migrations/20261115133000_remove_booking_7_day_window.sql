-- Booking approval must not be blocked by an arbitrary seven-day travel-date window.
-- Keep travel_date data intact; remove only the obsolete CHECK constraint.
alter table public.bookings
  drop constraint if exists valid_7_day_window;
