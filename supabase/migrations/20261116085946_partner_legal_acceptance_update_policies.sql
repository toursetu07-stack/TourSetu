-- Allow authenticated owners to replace their own legal acceptance when a policy version changes.
-- UPDATE has both row ownership predicates; no partner can alter another user's record.
grant select, insert, update on table public.agency_privacy_acceptances to authenticated;
drop policy if exists "Agencies can update their own privacy acceptance" on public.agency_privacy_acceptances;
create policy "Agencies can update their own privacy acceptance"
  on public.agency_privacy_acceptances
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on table public.hotel_privacy_acceptances to authenticated;
drop policy if exists "Hotels can update their own privacy acceptance" on public.hotel_privacy_acceptances;
create policy "Hotels can update their own privacy acceptance"
  on public.hotel_privacy_acceptances
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
