-- Passenger manifests are private customer booking data. Aadhaar photos are stored
-- in a private Storage bucket and referenced by object path, never a public URL.
-- IMPORTANT: public.bookings.id is an integer in this project.
create table if not exists public.customer_passenger_manifests (
    booking_id integer primary key references public.bookings(id) on delete cascade,
    customer_id uuid not null references auth.users(id) on delete cascade,
    leader_traveler_name text not null check (char_length(trim(leader_traveler_name)) between 2 and 120),
    whatsapp_mobile_number text not null check (char_length(whatsapp_mobile_number) between 10 and 15),
    aadhaar_photo_path text not null,
    exact_pickup_address text not null check (char_length(trim(exact_pickup_address)) between 5 and 1000),
    adults_count integer not null check (adults_count >= 0),
    kids_count integer not null check (kids_count >= 0),
    total_passengers integer not null check (total_passengers >= 1),
    consented_at timestamptz not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint passenger_manifest_total_matches check (total_passengers = adults_count + kids_count)
);

alter table public.customer_passenger_manifests enable row level security;
-- SQL grants permit the API role to access the table; RLS still limits rows to the owner.
grant select, insert, update on table public.customer_passenger_manifests to authenticated;

drop policy if exists "Customers read own passenger manifests" on public.customer_passenger_manifests;
create policy "Customers read own passenger manifests"
on public.customer_passenger_manifests for select
to authenticated using (customer_id = (select auth.uid()));

drop policy if exists "Customers create own passenger manifests for own bookings" on public.customer_passenger_manifests;
create policy "Customers create own passenger manifests for own bookings"
on public.customer_passenger_manifests for insert
to authenticated with check (
    customer_id = (select auth.uid())
    and exists (
        select 1 from public.bookings b
        where b.id = booking_id and b.customer_id = (select auth.uid())
          and lower(coalesce(b.status, '')) in ('approved','confirmed')
    )
    and split_part(aadhaar_photo_path, '/', 1) = (select auth.uid())::text
);

drop policy if exists "Customers update own passenger manifests for own bookings" on public.customer_passenger_manifests;
create policy "Customers update own passenger manifests for own bookings"
on public.customer_passenger_manifests for update
to authenticated using (customer_id = (select auth.uid()))
with check (
    customer_id = (select auth.uid())
    and exists (
        select 1 from public.bookings b
        where b.id = booking_id and b.customer_id = (select auth.uid())
          and lower(coalesce(b.status, '')) in ('approved','confirmed')
    )
    and split_part(aadhaar_photo_path, '/', 1) = (select auth.uid())::text
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('passenger-manifests', 'passenger-manifests', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "Customers upload own passenger manifest images" on storage.objects;
create policy "Customers upload own passenger manifest images"
on storage.objects for insert to authenticated
with check (
    bucket_id = 'passenger-manifests'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
        select 1 from public.bookings b
        where b.id::text = (storage.foldername(name))[2]
          and b.customer_id = (select auth.uid())
          and lower(coalesce(b.status, '')) in ('approved','confirmed')
    )
);

drop policy if exists "Customers read own passenger manifest images" on storage.objects;
create policy "Customers read own passenger manifest images"
on storage.objects for select to authenticated
using (bucket_id = 'passenger-manifests' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Customers delete own passenger manifest images" on storage.objects;
create policy "Customers delete own passenger manifest images"
on storage.objects for delete to authenticated
using (bucket_id = 'passenger-manifests' and (storage.foldername(name))[1] = (select auth.uid())::text);
