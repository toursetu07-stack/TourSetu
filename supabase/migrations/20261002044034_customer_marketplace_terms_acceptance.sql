-- Customer marketplace Terms & Conditions acceptance
-- Applied to Supabase project udfwcqrmksfyeigxgdws

create table if not exists public.customer_terms_acceptances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  terms_version text not null,
  accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists customer_terms_acceptances_version_idx
  on public.customer_terms_acceptances (terms_version);

alter table public.customer_terms_acceptances enable row level security;

revoke all on table public.customer_terms_acceptances from anon;
grant select, insert on table public.customer_terms_acceptances to authenticated;

drop policy if exists "Customers can read their own terms acceptance" on public.customer_terms_acceptances;
create policy "Customers can read their own terms acceptance"
  on public.customer_terms_acceptances
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Customers can record their own terms acceptance" on public.customer_terms_acceptances;
create policy "Customers can record their own terms acceptance"
  on public.customer_terms_acceptances
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
