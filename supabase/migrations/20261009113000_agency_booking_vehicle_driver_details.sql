-- Vehicle/driver compliance details are private agency booking records.
-- bookings.id is integer in the live schema, so booking_id must use integer too.
create table if not exists public.agency_booking_vehicle_assignments (
    booking_id integer primary key references public.bookings(id) on delete cascade,
    agency_id uuid not null references auth.users(id) on delete cascade,
    vehicle_model_name text not null check (char_length(trim(vehicle_model_name)) between 2 and 120),
    vehicle_registration_number text not null check (char_length(trim(vehicle_registration_number)) between 5 and 20),
    assigned_driver_name text not null check (char_length(trim(assigned_driver_name)) between 2 and 120),
    driver_contact_number text not null check (char_length(trim(driver_contact_number)) between 10 and 16),
    driver_commercial_license_path text not null,
    green_card_trip_card_path text not null,
    tourist_permit_type text not null default 'confirmed' check (tourist_permit_type in ('confirmed')),
    tourist_permit_confirmed boolean not null default false check (tourist_permit_confirmed = true),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.agency_booking_vehicle_assignments enable row level security;

drop policy if exists "Agencies read own booking vehicle assignments" on public.agency_booking_vehicle_assignments;
create policy "Agencies read own booking vehicle assignments"
on public.agency_booking_vehicle_assignments for select to authenticated
using (
    agency_id = (select auth.uid())
    and exists (select 1 from public.bookings b where b.id = booking_id and b.agency_id = (select auth.uid()))
);

drop policy if exists "Agencies create own booking vehicle assignments" on public.agency_booking_vehicle_assignments;
create policy "Agencies create own booking vehicle assignments"
on public.agency_booking_vehicle_assignments for insert to authenticated
with check (
    agency_id = (select auth.uid())
    and exists (
        select 1 from public.bookings b
        where b.id = booking_id and b.agency_id = (select auth.uid())
          and lower(coalesce(b.status, '')) not in ('approved','confirmed','paid','cancelled')
    )
    and split_part(driver_commercial_license_path, '/', 1) = (select auth.uid())::text
    and split_part(driver_commercial_license_path, '/', 2) = booking_id::text
    and split_part(green_card_trip_card_path, '/', 1) = (select auth.uid())::text
    and split_part(green_card_trip_card_path, '/', 2) = booking_id::text
);

drop policy if exists "Agencies update own booking vehicle assignments" on public.agency_booking_vehicle_assignments;
create policy "Agencies update own booking vehicle assignments"
on public.agency_booking_vehicle_assignments for update to authenticated
using (
    agency_id = (select auth.uid())
    and exists (select 1 from public.bookings b where b.id = booking_id and b.agency_id = (select auth.uid()))
)
with check (
    agency_id = (select auth.uid())
    and exists (select 1 from public.bookings b where b.id = booking_id and b.agency_id = (select auth.uid()))
    and split_part(driver_commercial_license_path, '/', 1) = (select auth.uid())::text
    and split_part(driver_commercial_license_path, '/', 2) = booking_id::text
    and split_part(green_card_trip_card_path, '/', 1) = (select auth.uid())::text
    and split_part(green_card_trip_card_path, '/', 2) = booking_id::text
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('agency-booking-vehicle-documents', 'agency-booking-vehicle-documents', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "Agencies upload own booking vehicle documents" on storage.objects;
create policy "Agencies upload own booking vehicle documents"
on storage.objects for insert to authenticated
with check (
    bucket_id = 'agency-booking-vehicle-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
        select 1 from public.bookings b
        where b.id::text = (storage.foldername(name))[2]
          and b.agency_id = (select auth.uid())
          and lower(coalesce(b.status, '')) not in ('approved','confirmed','paid','cancelled')
    )
);

drop policy if exists "Agencies read own booking vehicle documents" on storage.objects;
create policy "Agencies read own booking vehicle documents"
on storage.objects for select to authenticated
using (
    bucket_id = 'agency-booking-vehicle-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
        select 1 from public.agency_booking_vehicle_assignments a
        where a.booking_id::text = (storage.foldername(name))[2]
          and a.agency_id = (select auth.uid())
    )
);

drop policy if exists "Agencies delete own booking vehicle documents" on storage.objects;
create policy "Agencies delete own booking vehicle documents"
on storage.objects for delete to authenticated
using (
    bucket_id = 'agency-booking-vehicle-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
        select 1 from public.agency_booking_vehicle_assignments a
        where a.booking_id::text = (storage.foldername(name))[2]
          and a.agency_id = (select auth.uid())
    )
);
