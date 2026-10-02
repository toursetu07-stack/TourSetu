-- TourSetu production security hardening
-- Keeps sensitive booking/profile data private and enforces safe state transitions.
alter table public.bookings enable row level security;
drop policy if exists "Allow public full access" on public.bookings;
drop policy if exists "Agencies can update their own bookings" on public.bookings;
drop policy if exists "Agencies can view own bookings" on public.bookings;
drop policy if exists "Allow users to view their own bookings" on public.bookings;
drop policy if exists "Users can update own bookings" on public.bookings;
drop policy if exists "Allow users to insert their own bookings" on public.bookings;
revoke all on table public.bookings from anon, authenticated;
grant select, insert, update on table public.bookings to authenticated;
create policy "Customers can create own agency bookings" on public.bookings for insert to authenticated with check ((select auth.uid()) = customer_id);
create policy "Customers can view own agency bookings" on public.bookings for select to authenticated using ((select auth.uid()) = customer_id);
create policy "Agencies can view own agency bookings" on public.bookings for select to authenticated using ((select auth.uid()) = agency_id);
create policy "Customers can update own agency bookings" on public.bookings for update to authenticated using ((select auth.uid()) = customer_id) with check ((select auth.uid()) = customer_id);
create policy "Agencies can update own agency bookings" on public.bookings for update to authenticated using ((select auth.uid()) = agency_id) with check ((select auth.uid()) = agency_id);

create or replace function public.guard_booking_mutation() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if (select auth.uid()) = old.customer_id then
    if new.customer_id is distinct from old.customer_id or new.agency_id is distinct from old.agency_id or new.package_id is distinct from old.package_id or new.total_price is distinct from old.total_price or new.customer_email is distinct from old.customer_email or new.customer_phone is distinct from old.customer_phone or new.customer_address is distinct from old.customer_address or new.travel_date is distinct from old.travel_date or new.selected_vehicles is distinct from old.selected_vehicles or new.agency_contact is distinct from old.agency_contact then
      raise exception 'Customers cannot modify protected booking fields';
    end if;
    if new.status is distinct from old.status then
      if new.status='paid' and old.status not in ('approved','confirmed') then raise exception 'Payment is allowed only after agency approval'; end if;
      if new.status='cancelled' and old.status not in ('pending','approved','confirmed') then raise exception 'Booking cannot be cancelled from its current state'; end if;
      if new.status not in ('paid','cancelled') then raise exception 'Invalid customer booking status transition'; end if;
    end if;
  elsif (select auth.uid()) = old.agency_id then
    if new.customer_id is distinct from old.customer_id or new.agency_id is distinct from old.agency_id or new.package_id is distinct from old.package_id or new.total_price is distinct from old.total_price or new.customer_email is distinct from old.customer_email or new.customer_phone is distinct from old.customer_phone or new.customer_address is distinct from old.customer_address or new.travel_date is distinct from old.travel_date or new.selected_vehicles is distinct from old.selected_vehicles then
      raise exception 'Agencies cannot modify protected booking fields';
    end if;
    if new.status is distinct from old.status and not (old.status='pending' and new.status in ('approved','denied')) then raise exception 'Invalid agency booking status transition'; end if;
  else
    raise exception 'You are not allowed to modify this booking';
  end if;
  return new;
end; $$;
drop trigger if exists guard_booking_mutation on public.bookings;
create trigger guard_booking_mutation before update on public.bookings for each row execute function public.guard_booking_mutation();
revoke all on function public.guard_booking_mutation() from public, anon, authenticated;

alter table public.hotel_bookings enable row level security;
drop policy if exists "Allow users to insert bookings" on public.hotel_bookings;
drop policy if exists "Allow users to view bookings" on public.hotel_bookings;
drop policy if exists "Customers can create own hotel bookings" on public.hotel_bookings;
drop policy if exists "Customers can update own hotel bookings" on public.hotel_bookings;
drop policy if exists "Customers can view own hotel bookings" on public.hotel_bookings;
drop policy if exists "Hotel owners can update customer hotel bookings" on public.hotel_bookings;
drop policy if exists "Hotel owners can view customer hotel bookings" on public.hotel_bookings;
revoke all on table public.hotel_bookings from anon, authenticated;
grant select, insert, update on table public.hotel_bookings to authenticated;
create policy "Customers can create own hotel bookings" on public.hotel_bookings for insert to authenticated with check ((select auth.uid()) = customer_id);
create policy "Customers can view own hotel bookings" on public.hotel_bookings for select to authenticated using ((select auth.uid()) = customer_id);
create policy "Hotel owners can view own hotel bookings" on public.hotel_bookings for select to authenticated using (exists (select 1 from public.room_categories rc join public.hotels h on h.hotel_id=rc.hotel_id where rc.id=hotel_bookings.room_category_id and h.owner_id=(select auth.uid())));
create policy "Customers can update own hotel bookings" on public.hotel_bookings for update to authenticated using ((select auth.uid()) = customer_id) with check ((select auth.uid()) = customer_id);
create policy "Hotel owners can update own hotel bookings" on public.hotel_bookings for update to authenticated using (exists (select 1 from public.room_categories rc join public.hotels h on h.hotel_id=rc.hotel_id where rc.id=hotel_bookings.room_category_id and h.owner_id=(select auth.uid()))) with check (exists (select 1 from public.room_categories rc join public.hotels h on h.hotel_id=rc.hotel_id where rc.id=hotel_bookings.room_category_id and h.owner_id=(select auth.uid())));

create or replace function public.guard_hotel_booking_mutation() returns trigger language plpgsql security definer set search_path=public as $$
declare uid uuid := (select auth.uid()); owner_id uuid;
begin
  if uid is null then raise exception 'Authentication required'; end if;
  select h.owner_id into owner_id from public.room_categories rc join public.hotels h on h.hotel_id=rc.hotel_id where rc.id=old.room_category_id;
  if uid=old.customer_id then
    if new.customer_id is distinct from old.customer_id or new.room_category_id is distinct from old.room_category_id or new.hotel_name is distinct from old.hotel_name or new.room_type is distinct from old.room_type or new.location is distinct from old.location or new.check_in_date is distinct from old.check_in_date or new.check_out_date is distinct from old.check_out_date or new.rooms_booked is distinct from old.rooms_booked or new.price_per_night is distinct from old.price_per_night or new.total_nights is distinct from old.total_nights or new.subtotal_amount is distinct from old.subtotal_amount or new.gateway_fee is distinct from old.gateway_fee or new.service_fee is distinct from old.service_fee or new.total_amount is distinct from old.total_amount or new.cancellation_policy_agreed is distinct from old.cancellation_policy_agreed or new.payment_contact_number is distinct from old.payment_contact_number then
      raise exception 'Customers cannot modify protected hotel booking fields';
    end if;
    if new.booking_status is distinct from old.booking_status then
      if new.booking_status='confirmed' and old.booking_status not in ('approved','confirmed') then raise exception 'Hotel booking can be confirmed only after approval'; end if;
      if new.booking_status='cancelled' and old.booking_status not in ('pending','approved','confirmed') then raise exception 'Hotel booking cannot be cancelled from its current state'; end if;
      if new.booking_status not in ('cancelled','confirmed') then raise exception 'Invalid customer hotel booking status transition'; end if;
    end if;
    if new.payment_status is distinct from old.payment_status and not (new.payment_status='paid' and old.booking_status in ('approved','confirmed')) then raise exception 'Invalid customer hotel payment status transition'; end if;
  elsif uid=owner_id then
    if new.customer_id is distinct from old.customer_id or new.room_category_id is distinct from old.room_category_id or new.hotel_name is distinct from old.hotel_name or new.room_type is distinct from old.room_type or new.location is distinct from old.location or new.check_in_date is distinct from old.check_in_date or new.check_out_date is distinct from old.check_out_date or new.rooms_booked is distinct from old.rooms_booked or new.price_per_night is distinct from old.price_per_night or new.total_nights is distinct from old.total_nights or new.subtotal_amount is distinct from old.subtotal_amount or new.gateway_fee is distinct from old.gateway_fee or new.service_fee is distinct from old.service_fee or new.total_amount is distinct from old.total_amount or new.cancellation_policy_agreed is distinct from old.cancellation_policy_agreed or new.customer_email is distinct from old.customer_email or new.customer_phone is distinct from old.customer_phone or new.payment_status is distinct from old.payment_status then
      raise exception 'Hotel owners cannot modify protected booking fields';
    end if;
    if new.booking_status is distinct from old.booking_status and not (old.booking_status='pending' and new.booking_status in ('approved','denied')) then raise exception 'Invalid hotel owner booking status transition'; end if;
  else
    raise exception 'You are not allowed to modify this hotel booking';
  end if;
  return new;
end; $$;
drop trigger if exists guard_hotel_booking_mutation on public.hotel_bookings;
create trigger guard_hotel_booking_mutation before update on public.hotel_bookings for each row execute function public.guard_hotel_booking_mutation();
revoke all on function public.guard_hotel_booking_mutation() from public, anon, authenticated;

alter table public.profiles enable row level security;
drop policy if exists "Public Profiles" on public.profiles;
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Public profiles reading" on public.profiles;
drop policy if exists "Allow public insert during signup" on public.profiles;
drop policy if exists "Allow individual read access" on public.profiles;
drop policy if exists "User profiles modification" on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;
revoke all on table public.profiles from anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;
create policy "Users can view own profile" on public.profiles for select to authenticated using ((select auth.uid())=id);
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check ((select auth.uid())=id);
create policy "Users can update own profile" on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);

create index if not exists bookings_customer_id_idx on public.bookings(customer_id);
create index if not exists bookings_agency_id_idx on public.bookings(agency_id);
create index if not exists hotel_bookings_customer_id_idx on public.hotel_bookings(customer_id);
create index if not exists room_categories_hotel_id_idx on public.room_categories(hotel_id);
create index if not exists hotels_owner_id_idx on public.hotels(owner_id);
