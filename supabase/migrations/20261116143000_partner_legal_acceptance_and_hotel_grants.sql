-- Allow authenticated owners to renew their own versioned privacy acceptance.
alter table public.agency_privacy_acceptances enable row level security;
alter table public.hotel_privacy_acceptances enable row level security;

grant select, insert, update on public.agency_privacy_acceptances to authenticated;
grant select, insert, update on public.hotel_privacy_acceptances to authenticated;

drop policy if exists "Agencies can update their own privacy acceptance" on public.agency_privacy_acceptances;
create policy "Agencies can update their own privacy acceptance"
  on public.agency_privacy_acceptances
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Hotels can update their own privacy acceptance" on public.hotel_privacy_acceptances;
create policy "Hotels can update their own privacy acceptance"
  on public.hotel_privacy_acceptances
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Hotels has owner-scoped RLS policies. Grant public reads for marketplace
-- listings and partner writes only to editable fields. Approval status remains
-- admin-controlled; partners cannot write status or transfer ownership.
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
