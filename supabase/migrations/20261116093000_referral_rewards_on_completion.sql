-- Permit trusted backend completion transitions and create one referral reward per booking.
-- Existing customer/partner status transitions remain enforced by the guard functions.
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status = any (array['pending','held','paid','checked_in','completed','cancelled','disputed','approved','denied']::text[]));

alter table public.hotel_bookings drop constraint if exists hotel_bookings_booking_status_check;
alter table public.hotel_bookings add constraint hotel_bookings_booking_status_check
  check (booking_status = any (array['pending','approved','denied','cancelled','completed']::text[]));

-- This index may already exist in production; IF NOT EXISTS makes the migration repeat-safe.
create unique index if not exists referral_rewards_source_type_source_booking_id_key
  on public.referral_rewards (source_type, source_booking_id);

-- Allow only the Supabase service role to set the terminal completed state.
-- Preserve the existing guard logic for all authenticated customer/agency/hotel-owner requests.
do $migration$
declare
  v_definition text;
  v_replacement text;
begin
  v_definition := pg_get_functiondef('public.guard_booking_mutation()'::regprocedure);
  v_replacement := replace(
    v_definition,
    E'AS $function$\nbegin',
    E'AS $function$\nbegin\n  if (select auth.role()) = ''service_role'' and new.status = ''completed'' and old.status in (''paid'',''checked_in'') then\n    return new;\n  end if;'
  );
  if v_replacement = v_definition then
    raise exception 'Could not safely patch guard_booking_mutation()';
  end if;
  execute v_replacement;

  v_definition := pg_get_functiondef('public.guard_hotel_booking_mutation()'::regprocedure);
  -- Inject immediately before the existing authentication/authorization checks.
  v_replacement := replace(
    v_definition,
    E'BEGIN\n  IF uid IS NULL THEN',
    E'BEGIN\n  IF (select auth.role()) = ''service_role'' and new.booking_status = ''completed'' AND old.booking_status = ''approved'' AND old.payment_status = ''paid'' THEN\n    RETURN new;\n  END IF;\n  IF uid IS NULL THEN'
  );
  if v_replacement = v_definition then
    raise exception 'Could not safely patch guard_hotel_booking_mutation()';
  end if;
  execute v_replacement;
end;
$migration$;

-- Referral rewards are created only after a referred booking is completed.
create or replace function public.create_referral_reward(
 p_source_type text,p_source_booking_id text,p_referred_user_id uuid,
 p_payment_amount numeric,p_platform_rate numeric
) returns void language plpgsql security definer set search_path=public as $$
declare rid uuid; commission numeric(12,2); reward numeric(12,2);
begin
 if p_source_type not in ('agency_booking','hotel_booking') then raise exception 'Unsupported referral source type'; end if;
 select referrer_user_id into rid from public.referrals where referred_user_id=p_referred_user_id limit 1;
 if rid is null or rid=p_referred_user_id or coalesce(p_payment_amount,0)<=0 then return; end if;
 if p_source_type='agency_booking' then
   select coalesce(b.platform_commission_amount,round(coalesce(b.total_price,0)*p_platform_rate,2))
   into commission from public.bookings b where b.id::text=p_source_booking_id and b.customer_id=p_referred_user_id;
 else
   select round(coalesce(hb.service_fee,coalesce(hb.subtotal_amount,0)*p_platform_rate),2)
   into commission from public.hotel_bookings hb where hb.id::text=p_source_booking_id and hb.customer_id=p_referred_user_id;
 end if;
 commission:=coalesce(commission,0); if commission<=0 then return; end if;
 reward:=round(commission*0.10,2);
 insert into public.referral_rewards(referrer_user_id,referred_user_id,source_type,source_booking_id,payment_amount,platform_commission_rate,platform_commission_amount,referral_reward_rate,referral_reward_amount,status)
 values(rid,p_referred_user_id,p_source_type,p_source_booking_id,p_payment_amount,p_platform_rate,commission,0.10,reward,'pending')
 on conflict(source_type,source_booking_id) do nothing;
end; $$;

create or replace function public.trg_agency_referral_reward()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.status='completed' and coalesce(old.status,'')<>'completed' then
   perform public.create_referral_reward('agency_booking',new.id::text,new.customer_id,coalesce(new.customer_paid_amount,new.total_price,0),0.15);
 end if;
 return new;
end; $$;
drop trigger if exists agency_referral_reward_trigger on public.bookings;
create trigger agency_referral_reward_trigger after update of status on public.bookings for each row execute function public.trg_agency_referral_reward();

create or replace function public.trg_hotel_referral_reward()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.booking_status='completed' and coalesce(old.booking_status,'')<>'completed' and new.payment_status='paid' then
   perform public.create_referral_reward('hotel_booking',new.id::text,new.customer_id,coalesce(new.total_amount,0),0.04);
 end if;
 return new;
end; $$;
drop trigger if exists hotel_referral_reward_trigger on public.hotel_bookings;
create trigger hotel_referral_reward_trigger after update of booking_status,payment_status on public.hotel_bookings for each row execute function public.trg_hotel_referral_reward();
revoke all on function public.create_referral_reward(text,text,uuid,numeric,numeric) from public,anon,authenticated;
