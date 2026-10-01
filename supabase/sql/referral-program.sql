-- TourSetu Referral + Commission Migration
create extension if not exists pgcrypto;

create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.referral_visits (
  id uuid primary key default gen_random_uuid(),
  referral_code text not null,
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  visitor_key text,
  visited_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referral_code text not null,
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  referred_user_id uuid not null unique references auth.users(id) on delete cascade,
  first_login_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.referral_login_events (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  referred_user_id uuid not null references auth.users(id) on delete cascade,
  referral_code text not null,
  logged_in_at timestamptz not null default now()
);

create index if not exists referral_login_events_referrer_idx on public.referral_login_events(referrer_user_id, logged_in_at desc);

create table if not exists public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  referred_user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null check (source_type in ('agency_booking','hotel_booking')),
  source_booking_id text not null,
  payment_amount numeric(12,2) not null default 0,
  platform_commission_rate numeric(6,4) not null,
  platform_commission_amount numeric(12,2) not null default 0,
  referral_reward_rate numeric(6,4) not null default 0.10,
  referral_reward_amount numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','paid','cancelled')),
  created_at timestamptz not null default now(),
  unique (source_type, source_booking_id)
);

create index if not exists referral_visits_referrer_idx on public.referral_visits(referrer_user_id, visited_at desc);
create index if not exists referrals_referrer_idx on public.referrals(referrer_user_id);
create index if not exists referral_rewards_referrer_idx on public.referral_rewards(referrer_user_id, created_at desc);

create or replace function public.get_or_create_referral_code()
returns text language plpgsql security definer set search_path=public as $$
declare uid uuid := auth.uid(); existing_code text; new_code text;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  select code into existing_code from public.referral_codes where user_id=uid;
  if existing_code is not null then return existing_code; end if;
  new_code := 'TS-' || upper(substr(replace(uid::text,'-',''),1,10));
  insert into public.referral_codes(user_id,code) values(uid,new_code)
  on conflict(user_id) do update set code=excluded.code;
  return new_code;
end; $$;

create or replace function public.record_referral_visit(p_code text, p_visitor_key text default null)
returns void language plpgsql security definer set search_path=public as $$
declare rid uuid;
begin
  select user_id into rid from public.referral_codes where upper(code)=upper(trim(p_code));
  if rid is not null then
    insert into public.referral_visits(referral_code,referrer_user_id,visitor_key)
    values(trim(p_code),rid,p_visitor_key);
  end if;
end; $$;

create or replace function public.record_referral_login(p_code text)
returns void language plpgsql security definer set search_path=public as $$
declare rid uuid; uid uuid := auth.uid();
begin
  if uid is null then return; end if;
  select user_id into rid from public.referral_codes where upper(code)=upper(trim(p_code));
  if rid is null or rid=uid then return; end if;
  insert into public.referral_login_events(referrer_user_id,referred_user_id,referral_code) values(rid,uid,trim(p_code));
  insert into public.referrals as r(referral_code,referrer_user_id,referred_user_id,first_login_at)
  values(trim(p_code),rid,uid,now())
  on conflict(referred_user_id) do update
    set first_login_at=coalesce(r.first_login_at,excluded.first_login_at);
end; $$;

create or replace function public.create_referral_reward(
  p_source_type text,p_source_booking_id text,p_referred_user_id uuid,
  p_payment_amount numeric,p_platform_rate numeric
) returns void language plpgsql security definer set search_path=public as $$
declare rid uuid; commission numeric; reward numeric;
begin
  select referrer_user_id into rid from public.referrals where referred_user_id=p_referred_user_id limit 1;
  if rid is null or coalesce(p_payment_amount,0)<=0 then return; end if;
  commission:=round(p_payment_amount*p_platform_rate,2);
  reward:=round(commission*0.10,2);
  insert into public.referral_rewards(
    referrer_user_id,referred_user_id,source_type,source_booking_id,
    payment_amount,platform_commission_rate,platform_commission_amount,
    referral_reward_rate,referral_reward_amount
  ) values(rid,p_referred_user_id,p_source_type,p_source_booking_id,p_payment_amount,
           p_platform_rate,commission,0.10,reward)
  on conflict(source_type,source_booking_id) do nothing;
end; $$;

create or replace function public.trg_agency_referral_reward()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.status='paid' and coalesce(old.status,'')<>'paid' then
    perform public.create_referral_reward('agency_booking',new.id::text,new.customer_id,coalesce(new.total_price,0),0.15);
  end if;
  return new;
end; $$;

drop trigger if exists agency_referral_reward_trigger on public.bookings;
create trigger agency_referral_reward_trigger after update of status on public.bookings
for each row execute function public.trg_agency_referral_reward();

create or replace function public.trg_hotel_referral_reward()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.payment_status='paid' and coalesce(old.payment_status,'')<>'paid' then
    perform public.create_referral_reward('hotel_booking',new.id::text,new.customer_id,coalesce(new.total_amount,0),0.04);
  end if;
  return new;
end; $$;

drop trigger if exists hotel_referral_reward_trigger on public.hotel_bookings;
create trigger hotel_referral_reward_trigger after update of payment_status on public.hotel_bookings
for each row execute function public.trg_hotel_referral_reward();

alter table public.referral_codes enable row level security;
alter table public.referral_visits enable row level security;
alter table public.referral_login_events enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_rewards enable row level security;

drop policy if exists referral_codes_self_select on public.referral_codes;
create policy referral_codes_self_select on public.referral_codes for select to authenticated using(user_id=auth.uid());

drop policy if exists referrals_self_select on public.referrals;
create policy referrals_self_select on public.referrals for select to authenticated using(referrer_user_id=auth.uid() or referred_user_id=auth.uid());

drop policy if exists referral_rewards_self_select on public.referral_rewards;
create policy referral_rewards_self_select on public.referral_rewards for select to authenticated using(referrer_user_id=auth.uid());

create or replace function public.get_referral_dashboard_stats()
returns table(
  referral_visits bigint,
  login_events bigint,
  referred_users bigint,
  paid_conversions bigint,
  referred_payment_volume numeric,
  platform_commission_generated numeric,
  referral_earnings numeric
) language sql security definer set search_path=public as $$
  select
    (select count(*) from public.referral_visits v where v.referrer_user_id=auth.uid()),
    (select count(*) from public.referral_login_events le where le.referrer_user_id=auth.uid()),
    (select count(*) from public.referrals r where r.referrer_user_id=auth.uid()),
    (select count(rr.id) from public.referral_rewards rr where rr.referrer_user_id=auth.uid()),
    coalesce((select sum(rr.payment_amount) from public.referral_rewards rr where rr.referrer_user_id=auth.uid()),0)::numeric(12,2),
    coalesce((select sum(rr.platform_commission_amount) from public.referral_rewards rr where rr.referrer_user_id=auth.uid()),0)::numeric(12,2),
    coalesce((select sum(rr.referral_reward_amount) from public.referral_rewards rr where rr.referrer_user_id=auth.uid()),0)::numeric(12,2);
$$;

revoke all on function public.create_referral_reward(text,text,uuid,numeric,numeric) from public;
revoke all on function public.trg_agency_referral_reward() from public;
revoke all on function public.trg_hotel_referral_reward() from public;
grant execute on function public.get_or_create_referral_code() to authenticated;
grant execute on function public.record_referral_visit(text,text) to anon, authenticated;
grant execute on function public.record_referral_login(text) to authenticated;
grant execute on function public.get_referral_dashboard_stats() to authenticated;


-- ============================================================
-- AGENCY VERIFICATION / DOCUMENT REVIEW
-- ============================================================
alter table public.profiles
  add column if not exists is_approved boolean not null default false,
  add column if not exists approved_at timestamptz,
  add column if not exists approval_status text not null default 'pending';

create table if not exists public.agency_verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text,
  gst_no text,
  business_reg_no text,
  phone text,
  gst_document_path text,
  business_reg_document_path text,
  utdb_registration_certificate_path text,
  pan_card_path text,
  aadhaar_card_path text,
  cancelled_cheque_or_bank_passbook_path text,
  commercial_rc_path text,
  aitp_commercial_permit_path text,
  vehicle_insurance_path text,
  fitness_certificate_path text,
  commercial_driving_license_path text,
  police_verification_id_proof_path text,
  status text not null default 'pending' check (status in ('pending','approved','denied')),
  denial_reason text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agency_verification_requests enable row level security;

revoke all on public.agency_verification_requests from anon, authenticated;
grant select on public.agency_verification_requests to authenticated;

drop policy if exists "Agency can view own verification request" on public.agency_verification_requests;
create policy "Agency can view own verification request"
on public.agency_verification_requests for select
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.create_agency_verification_request()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  if coalesce(new.raw_user_meta_data->>'role','') = 'agency' then
    insert into public.profiles(id,email,role,company_name,gst_no,reg_no,license,phone,is_approved,approval_status)
    values (
      new.id,
      new.email,
      'agency',
      coalesce(new.raw_user_meta_data->>'company_name',''),
      nullif(new.raw_user_meta_data->>'gst',''),
      nullif(new.raw_user_meta_data->>'reg_no',''),
      nullif(new.raw_user_meta_data->>'license',''),
      nullif(new.raw_user_meta_data->>'phone',''),
      false,
      'pending'
    )
    on conflict (id) do update set
      email=excluded.email,
      role='agency',
      gst_no=excluded.gst_no,
      reg_no=excluded.reg_no,
      license=excluded.license,
      phone=excluded.phone,
      is_approved=false,
      approval_status='pending';

    insert into public.agency_verification_requests(user_id,email,gst_no,business_reg_no,phone)
    values (
      new.id,
      new.email,
      nullif(new.raw_user_meta_data->>'gst',''),
      nullif(new.raw_user_meta_data->>'reg_no',''),
      nullif(new.raw_user_meta_data->>'phone','')
    )
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_agency_verification on auth.users;
create trigger on_auth_user_agency_verification
after insert on auth.users
for each row execute function public.create_agency_verification_request();

create or replace function public.save_agency_verification_documents(
  p_gst_document_path text,
  p_business_reg_document_path text,
  p_utdb_registration_certificate_path text,
  p_pan_card_path text,
  p_aadhaar_card_path text,
  p_cancelled_cheque_or_bank_passbook_path text,
  p_commercial_rc_path text,
  p_aitp_commercial_permit_path text,
  p_vehicle_insurance_path text,
  p_fitness_certificate_path text,
  p_commercial_driving_license_path text,
  p_police_verification_id_proof_path text
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Authentication required'; end if;

  update public.agency_verification_requests
  set
    gst_document_path=p_gst_document_path,
    business_reg_document_path=p_business_reg_document_path,
    utdb_registration_certificate_path=p_utdb_registration_certificate_path,
    pan_card_path=p_pan_card_path,
    aadhaar_card_path=p_aadhaar_card_path,
    cancelled_cheque_or_bank_passbook_path=p_cancelled_cheque_or_bank_passbook_path,
    commercial_rc_path=p_commercial_rc_path,
    aitp_commercial_permit_path=p_aitp_commercial_permit_path,
    vehicle_insurance_path=p_vehicle_insurance_path,
    fitness_certificate_path=p_fitness_certificate_path,
    commercial_driving_license_path=p_commercial_driving_license_path,
    police_verification_id_proof_path=p_police_verification_id_proof_path,
    updated_at=now()
  where user_id=uid and status='pending';

  if not found then raise exception 'No pending agency verification request found'; end if;
end;
$$;

grant execute on function public.save_agency_verification_documents(
  text,text,text,text,text,text,text,text,text,text,text,text
) to authenticated;

create or replace function public.sync_agency_approval()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  update public.profiles
  set is_approved=(new.status='approved'),
      approval_status=new.status,
      approved_at=case when new.status='approved' then coalesce(new.reviewed_at,now()) else null end,
      updated_at=now()
  where id=new.user_id;
  return new;
end;
$$;

drop trigger if exists agency_verification_status_sync on public.agency_verification_requests;
create trigger agency_verification_status_sync
after update of status on public.agency_verification_requests
for each row execute function public.sync_agency_approval();

create or replace function public.is_agency_approved(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1 from public.agency_verification_requests
    where user_id=p_user_id and status='approved'
  );
$$;

revoke all on function public.is_agency_approved(uuid) from public;
grant execute on function public.is_agency_approved(uuid) to anon, authenticated;

-- Customer/public package visibility: only approved agencies are public.
drop policy if exists "Allow public read access" on public.packages;
drop policy if exists "Public Access" on public.packages;
drop policy if exists "Agency Select" on public.packages;
drop policy if exists "Agency Insert" on public.packages;
drop policy if exists "Enable insert for authenticated users only" on public.packages;
drop policy if exists "Enable insert/update for authenticated users" on public.packages;
drop policy if exists "Agency Update" on public.packages;

create policy "Approved agencies packages are public"
on public.packages for select
to anon, authenticated
using (
  public.is_agency_approved(agency_id)
  or (select auth.uid())=agency_id
);

create policy "Approved agencies can create packages"
on public.packages for insert
to authenticated
with check (
  (select auth.uid())=agency_id
  and public.is_agency_approved((select auth.uid()))
);

create policy "Agencies can update own packages"
on public.packages for update
to authenticated
using ((select auth.uid())=agency_id)
with check ((select auth.uid())=agency_id);

-- Private bucket for sensitive agency verification documents.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'agency-verification-documents',
  'agency-verification-documents',
  false,
  10485760,
  array['image/*','application/pdf']
)
on conflict (id) do update set
  public=false,
  file_size_limit=10485760,
  allowed_mime_types=array['image/*','application/pdf'];

drop policy if exists "Agency verification documents upload" on storage.objects;
create policy "Agency verification documents upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id='agency-verification-documents'
  and (storage.foldername(name))[1]=(select auth.uid()::text)
);

drop policy if exists "Agency verification documents read own" on storage.objects;
create policy "Agency verification documents read own"
on storage.objects for select
to authenticated
using (
  bucket_id='agency-verification-documents'
  and owner_id=(select auth.uid())
);

grant usage on schema public to authenticated;
