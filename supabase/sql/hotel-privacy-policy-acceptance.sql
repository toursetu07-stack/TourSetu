create table if not exists public.hotel_privacy_acceptances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  policy_version text not null,
  accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists hotel_privacy_acceptances_version_idx
  on public.hotel_privacy_acceptances (policy_version);

alter table public.hotel_privacy_acceptances enable row level security;

revoke all on table public.hotel_privacy_acceptances from anon;
grant select, insert on table public.hotel_privacy_acceptances to authenticated;

drop policy if exists "Hotels can read their own privacy acceptance" on public.hotel_privacy_acceptances;
create policy "Hotels can read their own privacy acceptance"
  on public.hotel_privacy_acceptances
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Hotels can record their own privacy acceptance" on public.hotel_privacy_acceptances;
create policy "Hotels can record their own privacy acceptance"
  on public.hotel_privacy_acceptances
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
