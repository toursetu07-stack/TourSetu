-- Grant Hotel partners access to their own hotel row while keeping approval
-- state admin-controlled. The existing RLS policies enforce owner_id = auth.uid().
grant select on public.hotels to anon, authenticated;
grant insert (
  owner_id, hotel_name, address, nearest_temple, total_rooms, available_rooms,
  room_price_per_night, hotel_photos, parking_photos, phone_masked,
  is_stop_sell, current_season, proximity_distance, owner_phone, city,
  front_pictures_urls, room_image, hide_from_search
) on public.hotels to authenticated;
grant update (
  owner_id, hotel_name, address, nearest_temple, total_rooms, available_rooms,
  room_price_per_night, hotel_photos, parking_photos, phone_masked,
  is_stop_sell, current_season, proximity_distance, owner_phone, city,
  front_pictures_urls, room_image, hide_from_search
) on public.hotels to authenticated;
