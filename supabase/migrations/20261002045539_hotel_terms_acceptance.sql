create table if not exists public.hotel_terms_acceptances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  terms_version text not null,
  accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists hotel_terms_acceptances_version_idx
  on public.hotel_terms_acceptances (terms_version);

alter table public.hotel_terms_acceptances enable row level security;

revoke all on table public.hotel_terms_acceptances from anon;
grant select, insert on table public.hotel_terms_acceptances to authenticated;

drop policy if exists "Hotels can read their own terms acceptance" on public.hotel_terms_acceptances;
create policy "Hotels can read their own terms acceptance"
  on public.hotel_terms_acceptances
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Hotels can record their own terms acceptance" on public.hotel_terms_acceptances;
create policy "Hotels can record their own terms acceptance"
  on public.hotel_terms_acceptances
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
