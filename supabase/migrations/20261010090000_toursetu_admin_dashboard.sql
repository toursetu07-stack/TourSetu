-- Secure TourSetu admin access. No account is promoted automatically.
create table if not exists public.toursetu_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.toursetu_admin_users enable row level security;
revoke all on public.toursetu_admin_users from anon, authenticated;

create or replace function public.is_toursetu_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.toursetu_admin_users a
    where a.user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_toursetu_admin() from public, anon;
grant execute on function public.is_toursetu_admin() to authenticated;

create table if not exists public.toursetu_admin_audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid not null references auth.users(id),
  action text not null check (char_length(action) between 2 and 80),
  entity_type text not null check (char_length(entity_type) between 2 and 80),
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.toursetu_admin_audit_log enable row level security;
revoke all on public.toursetu_admin_audit_log from anon, authenticated;
grant select, insert on public.toursetu_admin_audit_log to authenticated;
grant usage, select on sequence public.toursetu_admin_audit_log_id_seq to authenticated;
drop policy if exists "toursetu_admin_audit_select" on public.toursetu_admin_audit_log;
create policy "toursetu_admin_audit_select" on public.toursetu_admin_audit_log
for select to authenticated using (public.is_toursetu_admin());
drop policy if exists "toursetu_admin_audit_insert" on public.toursetu_admin_audit_log;
create policy "toursetu_admin_audit_insert" on public.toursetu_admin_audit_log
for insert to authenticated with check (
  public.is_toursetu_admin() and actor_user_id = (select auth.uid())
);

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','bookings','hotels','hotel_bookings','packages',
    'agency_verification_requests','hotel_verification_requests',
    'referrals','referral_rewards'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop policy if exists %I on public.%I', 'toursetu_admin_select', t);
      execute format('create policy %I on public.%I for select to authenticated using (public.is_toursetu_admin())', 'toursetu_admin_select', t);
    end if;
  end loop;
  foreach t in array array[
    'profiles','bookings','hotels','hotel_bookings',
    'agency_verification_requests','hotel_verification_requests'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop policy if exists %I on public.%I', 'toursetu_admin_update', t);
      execute format('create policy %I on public.%I for update to authenticated using (public.is_toursetu_admin()) with check (public.is_toursetu_admin())', 'toursetu_admin_update', t);
    end if;
  end loop;
end $$;
