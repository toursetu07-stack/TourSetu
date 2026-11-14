-- TourSetu Agency Verification / KYC
-- The live Supabase project already contains these objects.
-- Keep this migration in source control for reproducible environments.

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

drop policy if exists "Agency can view own verification request" on public.agency_verification_requests;
create policy "Agency can view own verification request"
on public.agency_verification_requests
for select to authenticated
using (auth.uid() = user_id);

-- Agency users submit document paths only through the SECURITY DEFINER RPC.
-- Keep the document bucket private.
insert into storage.buckets (id,name,public)
values ('agency-verification-documents','agency-verification-documents',false)
on conflict (id) do update set public=false;

drop policy if exists "Agency verification documents upload" on storage.objects;
create policy "Agency verification documents upload"
on storage.objects for insert to authenticated
with check (
  bucket_id='agency-verification-documents'
  and (storage.foldername(name))[1]=(select auth.uid()::text)
);

drop policy if exists "Agency verification documents read own" on storage.objects;
create policy "Agency verification documents read own"
on storage.objects for select to authenticated
using (
  bucket_id='agency-verification-documents'
  and owner_id=(select auth.uid()::text)
);

-- Existing application trigger/function keeps profiles.is_approved and
-- profiles.approval_status synchronized with the request status.
-- Customer package visibility is protected by the packages SELECT policy:
-- only approved agencies' packages are public.
--
-- ADMIN REVIEW (run from Supabase SQL Editor / Table Editor):
--
-- Approve:
-- update public.agency_verification_requests
-- set status='approved', reviewed_by='<ADMIN_USER_UUID>', reviewed_at=now(),
--     denial_reason=null, updated_at=now()
-- where id='<REQUEST_UUID>' and status='pending';
--
-- Deny:
-- update public.agency_verification_requests
-- set status='denied', reviewed_by='<ADMIN_USER_UUID>', reviewed_at=now(),
--     denial_reason='Document verification failed', updated_at=now()
-- where id='<REQUEST_UUID>' and status='pending';
--
-- The status trigger automatically updates public.profiles:
-- approved -> is_approved=true
-- denied/pending -> is_approved=false
