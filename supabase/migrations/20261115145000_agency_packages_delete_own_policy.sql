-- Allow authenticated agencies to delete only their own package rows.
-- Keep the same ownership boundary used by the existing package UPDATE policy.
drop policy if exists "Agencies can delete own packages" on public.packages;

create policy "Agencies can delete own packages"
on public.packages
for delete
to authenticated
using ((select auth.uid()) = agency_id);
