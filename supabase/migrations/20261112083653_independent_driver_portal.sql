-- Independent driver onboarding, private KYC, vehicle listings and request decisions.
create table if not exists public.driver_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text not null,
  city text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','suspended')),
  denial_reason text,
  id_document_path text,
  pan_document_path text,
  licence_front_path text,
  licence_back_path text,
  police_verification_path text,
  bank_proof_path text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.driver_vehicles (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.driver_profiles(user_id) on delete cascade,
  vehicle_type text not null,
  make_model text not null,
  registration_number text not null,
  seating_capacity integer not null check (seating_capacity between 1 and 100),
  price_per_km numeric(10,2) not null check (price_per_km >= 0),
  rc_document_path text not null,
  permit_document_path text,
  insurance_document_path text not null,
  fitness_document_path text,
  puc_document_path text,
  vehicle_photo_path text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create table if not exists public.driver_service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  driver_id uuid not null references public.driver_profiles(user_id) on delete cascade,
  request_group_id uuid not null default gen_random_uuid(),
  trip_details jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','confirmed','denied','cancelled')),
  driver_response_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists driver_vehicles_driver_idx on public.driver_vehicles(driver_id);
create index if not exists driver_requests_driver_status_idx on public.driver_service_requests(driver_id,status,created_at desc);
create index if not exists driver_requests_customer_idx on public.driver_service_requests(customer_id,created_at desc);

alter table public.driver_profiles enable row level security;
alter table public.driver_vehicles enable row level security;
alter table public.driver_service_requests enable row level security;

drop policy if exists "driver profile owner/admin read" on public.driver_profiles;
create policy "driver profile owner/admin read" on public.driver_profiles for select to authenticated
using (user_id = auth.uid() or public.is_toursetu_admin());
drop policy if exists "driver profile owner insert" on public.driver_profiles;
create policy "driver profile owner insert" on public.driver_profiles for insert to authenticated
with check (user_id = auth.uid() and status = 'pending');
drop policy if exists "driver profile owner update safe" on public.driver_profiles;
create policy "driver profile owner update safe" on public.driver_profiles for update to authenticated
using (user_id = auth.uid() or public.is_toursetu_admin())
with check (
  public.is_toursetu_admin()
  or (user_id = auth.uid() and status = 'pending')
);
drop policy if exists "driver vehicle approved public read" on public.driver_vehicles;
create policy "driver vehicle approved public read" on public.driver_vehicles for select to anon, authenticated
using (status = 'approved' and exists (
  select 1 from public.driver_profiles dp where dp.user_id = driver_id and dp.status = 'approved'
));
drop policy if exists "driver vehicle owner/admin read" on public.driver_vehicles;
create policy "driver vehicle owner/admin read" on public.driver_vehicles for select to authenticated
using (driver_id = auth.uid() or public.is_toursetu_admin());
drop policy if exists "driver vehicle owner insert" on public.driver_vehicles;
create policy "driver vehicle owner insert" on public.driver_vehicles for insert to authenticated
with check (driver_id = auth.uid() and exists (
  select 1 from public.driver_profiles dp where dp.user_id = auth.uid() and dp.status = 'approved'
));
drop policy if exists "driver vehicle owner update" on public.driver_vehicles;
create policy "driver vehicle owner update" on public.driver_vehicles for update to authenticated
using (driver_id = auth.uid() or public.is_toursetu_admin())
with check (public.is_toursetu_admin() or (driver_id = auth.uid() and status <> 'approved'));

drop policy if exists "driver request parties read" on public.driver_service_requests;
create policy "driver request parties read" on public.driver_service_requests for select to authenticated
using (customer_id = auth.uid() or driver_id = auth.uid() or public.is_toursetu_admin());
drop policy if exists "customer create driver request" on public.driver_service_requests;
create policy "customer create driver request" on public.driver_service_requests for insert to authenticated
with check (customer_id = auth.uid() and status = 'pending' and exists (
  select 1 from public.driver_profiles dp where dp.user_id = driver_id and dp.status = 'approved'
));
drop policy if exists "driver decide own pending request" on public.driver_service_requests;
create policy "driver decide own pending request" on public.driver_service_requests for update to authenticated
using (driver_id = auth.uid() and status = 'pending')
with check (driver_id = auth.uid() and status in ('confirmed','denied'));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('driver-verification-documents','driver-verification-documents',false,10485760,
  array['image/jpeg','image/png','application/pdf','image/webp'])
on conflict (id) do update set public=false,file_size_limit=10485760,
  allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "driver KYC owner/admin read" on storage.objects;
create policy "driver KYC owner/admin read" on storage.objects for select to authenticated
using (bucket_id='driver-verification-documents' and (
  (storage.foldername(name))[1] = auth.uid()::text or public.is_toursetu_admin()
));
drop policy if exists "driver KYC owner upload" on storage.objects;
create policy "driver KYC owner upload" on storage.objects for insert to authenticated
with check (bucket_id='driver-verification-documents' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "driver KYC owner update" on storage.objects;
create policy "driver KYC owner update" on storage.objects for update to authenticated
using (bucket_id='driver-verification-documents' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id='driver-verification-documents' and (storage.foldername(name))[1] = auth.uid()::text);
