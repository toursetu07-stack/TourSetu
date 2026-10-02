-- Allow existing partner acceptance rows to be updated when the terms version changes.
-- This is required because agency_terms_acceptances.user_id is the primary key
-- and the app updates the same row for a new terms version.
drop policy if exists "Agencies can update their own terms acceptance" on public.agency_terms_acceptances;
create policy "Agencies can update their own terms acceptance"
on public.agency_terms_acceptances
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Same protection for Hotel Partner Terms when their terms version changes.
drop policy if exists "Hotels can update their own terms acceptance" on public.hotel_terms_acceptances;
create policy "Hotels can update their own terms acceptance"
on public.hotel_terms_acceptances
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
