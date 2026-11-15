-- Driver legal terms and privacy acceptance (versioned, owner-scoped).
create table if not exists public.driver_legal_acceptances (
  driver_id uuid primary key references auth.users(id) on delete cascade,
  terms_version text not null,
  privacy_version text not null,
  accepted_at timestamptz not null default now(),
  constraint driver_legal_acceptances_terms_version_nonempty check (length(trim(terms_version)) > 0),
  constraint driver_legal_acceptances_privacy_version_nonempty check (length(trim(privacy_version)) > 0)
);

alter table public.driver_legal_acceptances enable row level security;

drop policy if exists "Drivers can read their own legal acceptance" on public.driver_legal_acceptances;
create policy "Drivers can read their own legal acceptance"
  on public.driver_legal_acceptances for select to authenticated
  using ((select auth.uid()) = driver_id);

drop policy if exists "Drivers can record their own legal acceptance" on public.driver_legal_acceptances;
create policy "Drivers can record their own legal acceptance"
  on public.driver_legal_acceptances for insert to authenticated
  with check ((select auth.uid()) = driver_id);

drop policy if exists "Drivers can update their own legal acceptance" on public.driver_legal_acceptances;
create policy "Drivers can update their own legal acceptance"
  on public.driver_legal_acceptances for update to authenticated
  using ((select auth.uid()) = driver_id)
  with check ((select auth.uid()) = driver_id);

revoke all on public.driver_legal_acceptances from anon;
grant select, insert, update on public.driver_legal_acceptances to authenticated;
grant all on public.driver_legal_acceptances to service_role;
