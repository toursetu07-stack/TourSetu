-- Stores the hotel room-interior image uploaded from Hotel Dashboard.
-- Safe to run repeatedly.
alter table public.hotels
    add column if not exists room_image text;
