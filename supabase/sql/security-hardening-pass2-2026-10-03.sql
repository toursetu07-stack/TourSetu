-- TourSetu security hardening pass 2 (2026-10-03)
-- Applied to production Supabase project as migration security_hardening_pass2_2026_10_03.
-- See production migration history for the authoritative execution record.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.is_agency_approved(p_user_id uuid)
returns boolean language sql stable security definer set search_path=''
as $$
  select exists(
    select 1 from public.agency_verification_requests
    where user_id=p_user_id and status='approved'
  );
$$;

revoke all on function private.is_agency_approved(uuid) from public;
grant execute on function private.is_agency_approved(uuid) to anon, authenticated;

drop policy if exists "Approved agencies packages are public" on public.packages;
create policy "Approved agencies packages are public"
on public.packages for select to anon, authenticated
using ((select private.is_agency_approved(agency_id)) or (select auth.uid())=agency_id);

drop policy if exists "Approved agencies can create packages" on public.packages;
create policy "Approved agencies can create packages"
on public.packages for insert to authenticated
with check (
  (select auth.uid())=agency_id
  and (select private.is_agency_approved((select auth.uid())))
);

drop function if exists public.is_agency_approved(uuid);

create or replace function public.guard_booking_insert()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if new.customer_id is distinct from (select auth.uid()) then
    raise exception 'Booking customer must match the authenticated user';
  end if;
  if coalesce(new.status,'pending') <> 'pending' then
    raise exception 'New bookings must start in pending state';
  end if;
  if new.package_id is null or new.agency_id is null or not exists (
    select 1 from public.packages p
    where p.id::text=new.package_id
      and p.agency_id=new.agency_id
      and (select private.is_agency_approved(p.agency_id))
  ) then raise exception 'Invalid or unapproved package/agency'; end if;
  if coalesce(new.total_price,0) < 0 then raise exception 'Invalid booking price'; end if;
  return new;
end;
$$;
revoke all on function public.guard_booking_insert() from public, anon, authenticated;

revoke all on table public.agency_profiles from anon, authenticated;
revoke all on table public.referral_login_events from anon, authenticated;
revoke all on table public.referral_visits from anon, authenticated;
revoke all on table public.services from anon, authenticated;

revoke all on table public.hotel_verification_requests from anon, authenticated;
grant select on table public.hotel_verification_requests to authenticated;

revoke all on table public.referral_codes from anon, authenticated;
grant select on table public.referral_codes to authenticated;
revoke all on table public.referrals from anon, authenticated;
grant select on table public.referrals to authenticated;
revoke all on table public.referral_rewards from anon, authenticated;
grant select on table public.referral_rewards to authenticated;

create or replace function public.save_agency_verification_documents(
  p_gst_document_path text,p_business_reg_document_path text,
  p_utdb_registration_certificate_path text,p_pan_card_path text,
  p_aadhaar_card_path text,p_cancelled_cheque_or_bank_passbook_path text,
  p_commercial_rc_path text,p_aitp_commercial_permit_path text,
  p_vehicle_insurance_path text,p_fitness_certificate_path text,
  p_commercial_driving_license_path text,p_police_verification_id_proof_path text
)
returns void language plpgsql security definer set search_path=''
as $$
declare uid uuid:=auth.uid(); path_value text;
begin
  if uid is null then raise exception 'Authentication required'; end if;
  foreach path_value in array array[
    p_gst_document_path,p_business_reg_document_path,
    p_utdb_registration_certificate_path,p_pan_card_path,p_aadhaar_card_path,
    p_cancelled_cheque_or_bank_passbook_path,p_commercial_rc_path,
    p_aitp_commercial_permit_path,p_vehicle_insurance_path,p_fitness_certificate_path,
    p_commercial_driving_license_path,p_police_verification_id_proof_path
  ] loop
    if path_value is not null and (
      split_part(path_value,'/',1)<>uid::text
      or path_value ~ '(^|/)\\.\\.(/|$)'
      or path_value like '%\\\\%'
    ) then raise exception 'Invalid verification document path'; end if;
  end loop;
  update public.agency_verification_requests
  set gst_document_path=p_gst_document_path,
      business_reg_document_path=p_business_reg_document_path,
      utdb_registration_certificate_path=p_utdb_registration_certificate_path,
      pan_card_path=p_pan_card_path,aadhaar_card_path=p_aadhaar_card_path,
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
revoke all on function public.save_agency_verification_documents(text,text,text,text,text,text,text,text,text,text,text,text) from public;
grant execute on function public.save_agency_verification_documents(text,text,text,text,text,text,text,text,text,text,text,text) to authenticated;

create or replace function public.save_hotel_verification_documents(
  p_uttarakhand_tourism_utbm_registration_path text default null,
  p_trade_license_local_authority_license_path text default null,
  p_gst_certificate_msme_udyam_path text default null,
  p_fire_safety_noc_path text default null,
  p_police_noc_path text default null
)
returns void language plpgsql security definer set search_path=''
as $$
declare uid uuid:=auth.uid(); path_value text;
begin
  if uid is null then raise exception 'Authentication required'; end if;
  foreach path_value in array array[
    p_uttarakhand_tourism_utbm_registration_path,
    p_trade_license_local_authority_license_path,
    p_gst_certificate_msme_udyam_path,
    p_fire_safety_noc_path,
    p_police_noc_path
  ] loop
    if path_value is not null and (
      split_part(path_value,'/',1)<>uid::text
      or path_value ~ '(^|/)\\.\\.(/|$)'
      or path_value like '%\\\\%'
    ) then raise exception 'Invalid verification document path'; end if;
  end loop;
  insert into public.hotel_verification_requests(user_id,email,status)
  values(uid,auth.email(),'pending') on conflict (user_id) do nothing;
  update public.hotel_verification_requests
  set uttarakhand_tourism_utbm_registration_path=coalesce(p_uttarakhand_tourism_utbm_registration_path,uttarakhand_tourism_utbm_registration_path),
      trade_license_local_authority_license_path=coalesce(p_trade_license_local_authority_license_path,trade_license_local_authority_license_path),
      gst_certificate_msme_udyam_path=coalesce(p_gst_certificate_msme_udyam_path,gst_certificate_msme_udyam_path),
      fire_safety_noc_path=coalesce(p_fire_safety_noc_path,fire_safety_noc_path),
      police_noc_path=coalesce(p_police_noc_path,police_noc_path),
      updated_at=now()
  where user_id=uid;
end;
$$;
revoke all on function public.save_hotel_verification_documents(text,text,text,text,text) from public;
grant execute on function public.save_hotel_verification_documents(text,text,text,text,text) to authenticated;

update storage.buckets set public=false,file_size_limit=10485760,
  allowed_mime_types=array['application/pdf','image/jpeg','image/png','image/webp']
where id='business-docs';

update storage.buckets set file_size_limit=5242880,
  allowed_mime_types=array['image/jpeg','image/png','image/webp']
where id in ('hotel-images','hotel-media');

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;


-- Follow-up: move public referral visit authorization to RLS + a private lookup helper.
create or replace function private.resolve_referral_code(p_code text)
returns uuid language sql stable security definer set search_path=''
as $$
  select rc.user_id from public.referral_codes rc
  where upper(rc.code)=upper(trim(p_code)) limit 1;
$$;
revoke all on function private.resolve_referral_code(text) from public;
grant execute on function private.resolve_referral_code(text) to anon, authenticated;

revoke all on table public.referral_visits from anon, authenticated;
grant insert on table public.referral_visits to anon, authenticated;
drop policy if exists "Public referral visit insert" on public.referral_visits;
create policy "Public referral visit insert"
on public.referral_visits for insert to anon, authenticated
with check (
  visitor_key is not null
  and length(visitor_key) between 16 and 128
  and referrer_user_id=(select private.resolve_referral_code(referral_code))
);

create or replace function public.record_referral_visit(p_code text,p_visitor_key text default null)
returns void language plpgsql security invoker set search_path=''
as $$
begin
  if p_code is null or length(trim(p_code)) not between 3 and 64 then return; end if;
  if p_visitor_key is null or length(p_visitor_key) not between 16 and 128 then return; end if;
  insert into public.referral_visits(referral_code,referrer_user_id,visitor_key)
  values(upper(trim(p_code)),(select private.resolve_referral_code(p_code)),p_visitor_key);
end;
$$;
revoke all on function public.record_referral_visit(text,text) from public,anon,authenticated;
grant execute on function public.record_referral_visit(text,text) to anon,authenticated;
