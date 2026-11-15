-- Let an authenticated agency read only its own verification flag.
grant select on public.agency_profiles to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'agency_profiles'
      and policyname = 'Agency can view own verification flag'
  ) then
    create policy "Agency can view own verification flag"
      on public.agency_profiles
      for select
      to authenticated
      using ((select auth.uid()) = id);
  end if;
end
$$;

-- Publish the three owner-scoped status sources for realtime updates.
do $$
declare
  table_name text;
begin
  foreach table_name in array array['agency_profiles', 'agency_verification_requests', 'profiles']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end
$$;
