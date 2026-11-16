-- Add owner-scoped UPDATE access for versioned Agency and Hotel privacy acceptance.
alter table public.agency_privacy_acceptances enable row level security;
alter table public.hotel_privacy_acceptances enable row level security;

grant select, insert, update on public.agency_privacy_acceptances to authenticated;
grant select, insert, update on public.hotel_privacy_acceptances to authenticated;

drop policy if exists "Agencies can update their own privacy acceptance" on public.agency_privacy_acceptances;
create policy "Agencies can update their own privacy acceptance"
  on public.agency_privacy_acceptances for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Hotels can update their own privacy acceptance" on public.hotel_privacy_acceptances;
create policy "Hotels can update their own privacy acceptance"
  on public.hotel_privacy_acceptances for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
