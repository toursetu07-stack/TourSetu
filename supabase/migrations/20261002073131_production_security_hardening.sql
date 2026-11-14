-- KYC buckets are private and constrained to document/image MIME types.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('agency-verification-documents','agency-verification-documents',false,10485760,array['application/pdf','image/jpeg','image/png','image/webp']::text[]),
  ('hotel-verification-documents','hotel-verification-documents',false,10485760,array['application/pdf','image/jpeg','image/png','image/webp']::text[])
on conflict (id) do update
set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

-- TourSetu Phase 4 production security hardening.
--
-- Applied to production on 2026-10-02 before this migration was committed.
-- This migration intentionally does NOT contain any secret values.
-- Add/rotate notify_booking_service_key in Supabase Vault separately.

-- 1) Least-privilege execution for public-schema functions.
revoke execute on all functions in schema public from public;
revoke execute on all functions in schema public from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;

grant execute on function public.record_referral_visit(text, text) to anon, authenticated;
grant execute on function public.record_referral_login(text) to authenticated;
grant execute on function public.get_or_create_referral_code() to authenticated;
grant execute on function public.get_referral_dashboard_stats() to authenticated;
grant execute on function public.ensure_my_hotel_verification_request() to authenticated;
grant execute on function public.save_agency_verification_documents(
  text,text,text,text,text,text,text,text,text,text,text,text
) to authenticated;
grant execute on function public.save_hotel_verification_documents(
  text,text,text,text,text
) to authenticated;
grant execute on function public.is_agency_approved(uuid) to anon, authenticated;

-- 2) Public hotel media remains publicly retrievable, but writes are owner-only.
drop policy if exists "Allow hotel media uploads" on storage.objects;

drop policy if exists "Hotel media owner select" on storage.objects;
drop policy if exists "Hotel media owner upload" on storage.objects;
drop policy if exists "Hotel media owner update" on storage.objects;
drop policy if exists "Hotel media owner delete" on storage.objects;

create policy "Hotel media owner select"
on storage.objects for select to authenticated
using (bucket_id = 'hotel-media' and owner_id = (select auth.uid()::text));

create policy "Hotel media owner upload"
on storage.objects for insert to authenticated
with check (bucket_id = 'hotel-media' and owner_id = (select auth.uid()::text));

create policy "Hotel media owner update"
on storage.objects for update to authenticated
using (bucket_id = 'hotel-media' and owner_id = (select auth.uid()::text))
with check (bucket_id = 'hotel-media' and owner_id = (select auth.uid()::text));

create policy "Hotel media owner delete"
on storage.objects for delete to authenticated
using (bucket_id = 'hotel-media' and owner_id = (select auth.uid()::text));

-- 3) Remove legacy anonymous CRUD policies from hotel-images.
drop policy if exists "Give anon users access to JPG images in folder 1f678hd_0" on storage.objects;
drop policy if exists "Give anon users access to JPG images in folder 1f678hd_1" on storage.objects;
drop policy if exists "Give anon users access to JPG images in folder 1f678hd_2" on storage.objects;

create policy "Hotel images owner select"
on storage.objects for select to authenticated
using (bucket_id = 'hotel-images' and owner_id = (select auth.uid()::text));

create policy "Hotel images owner upload"
on storage.objects for insert to authenticated
with check (bucket_id = 'hotel-images' and owner_id = (select auth.uid()::text));

create policy "Hotel images owner update"
on storage.objects for update to authenticated
using (bucket_id = 'hotel-images' and owner_id = (select auth.uid()::text))
with check (bucket_id = 'hotel-images' and owner_id = (select auth.uid()::text));

create policy "Hotel images owner delete"
on storage.objects for delete to authenticated
using (bucket_id = 'hotel-images' and owner_id = (select auth.uid()::text));

-- 4) Pin search_path on mutable/definer helper functions flagged by the
-- Supabase security advisor.
create or replace function public.check_hotel_inventory_visibility()
returns trigger language plpgsql set search_path = ''
as $function$
declare
  h_id uuid;
  total_avail int;
begin
  h_id := new.hotel_id;
  select coalesce(sum(available_rooms), 0)
    into total_avail
    from public.rooms
   where hotel_id = h_id;

  if total_avail <= 0 then
    update public.hotels set hide_from_search = true where hotel_id = h_id;
  else
    update public.hotels set hide_from_search = false where hotel_id = h_id;
  end if;

  return new;
end;
$function$;

create or replace function public.notify_hotel_on_payment()
returns trigger language plpgsql set search_path = ''
as $function$
begin
  if new.status = 'paid' and old.status <> 'paid' then
    perform pg_catalog.pg_notify(
      'hotel_payment_channel',
      pg_catalog.json_build_object(
        'booking_id', new.id,
        'hotel_id', new.hotel_id,
        'customer_id', new.customer_id,
        'amount', new.total_price,
        'timestamp', pg_catalog.now()
      )::text
    );
  end if;
  return new;
end;
$function$;

create or replace function public.release_expired_holds()
returns void language plpgsql security definer set search_path = ''
as $function$
begin
  update public.hotels h
     set available_rooms = h.available_rooms + 1
    from public.bookings b
   where b.hotel_id = h.id
     and b.status = 'held'
     and b.hold_expires_at < pg_catalog.now();

  update public.bookings
     set status = 'cancelled'
   where status = 'held'
     and hold_expires_at < pg_catalog.now();
end;
$function$;

create or replace function public.release_expired_inventory_locks()
returns void language plpgsql set search_path = ''
as $function$
begin
  with expired_bookings as (
    update public.bookings
       set status = 'cancelled'
     where status = 'held'
       and hold_expires_at < pg_catalog.now()
     returning hotel_id
  )
  update public.hotels
     set available_rooms = available_rooms + 1,
         held_rooms = pg_catalog.greatest(held_rooms - 1, 0)
   where id in (select hotel_id from expired_bookings);
end;
$function$;

-- 5) Booking webhook credential must live in Vault, never in a trigger
-- definition. Production already has the secret named below.
create or replace function public.notify_booking_webhook()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_key text;
  v_request_id bigint;
  v_payload jsonb;
begin
  select decrypted_secret into v_key
    from vault.decrypted_secrets
   where name = 'notify_booking_service_key'
   limit 1;

  if v_key is null then
    raise warning 'notify_booking_service_key is not configured; booking email webhook skipped';
    return new;
  end if;

  v_payload := pg_catalog.jsonb_build_object(
    'old_record', old,
    'record', new,
    'type', tg_op,
    'table', tg_table_name,
    'schema', tg_table_schema
  );

  select net.http_post(
    'https://udfwcqrmksfyeigxgdws.supabase.co/functions/v1/notify-booking',
    v_payload,
    '{}'::jsonb,
    pg_catalog.jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    5000
  )
  into v_request_id;

  return new;
end;
$function$;

revoke execute on function public.notify_booking_webhook() from public, anon, authenticated;

drop trigger if exists notify_on_booking on public.bookings;
create trigger notify_on_booking
after insert or update on public.bookings
for each row
execute function public.notify_booking_webhook();
