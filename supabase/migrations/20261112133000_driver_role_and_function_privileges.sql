-- Allow independent drivers to have a profile role and keep the signup trigger private.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role = any (array['customer'::text, 'agency'::text, 'hotel'::text, 'driver'::text]));

revoke all on function public.create_driver_profile_on_signup() from public;
revoke all on function public.create_driver_profile_on_signup() from anon;
revoke all on function public.create_driver_profile_on_signup() from authenticated;
