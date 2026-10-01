-- TourSetu Referral + Commission Migration
create extension if not exists pgcrypto;

create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.referral_visits (
  id uuid primary key default gen_random_uuid(),
  referral_code text not null,
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  visitor_key text,
  visited_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referral_code text not null,
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  referred_user_id uuid not null unique references auth.users(id) on delete cascade,
  first_login_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  referred_user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null check (source_type in ('agency_booking','hotel_booking')),
  source_booking_id text not null,
  payment_amount numeric(12,2) not null default 0,
  platform_commission_rate numeric(6,4) not null,
  platform_commission_amount numeric(12,2) not null default 0,
  referral_reward_rate numeric(6,4) not null default 0.10,
  referral_reward_amount numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','paid','cancelled')),
  created_at timestamptz not null default now(),
  unique (source_type, source_booking_id)
);

create index if not exists referral_visits_referrer_idx on public.referral_visits(referrer_user_id, visited_at desc);
create index if not exists referrals_referrer_idx on public.referrals(referrer_user_id);
create index if not exists referral_rewards_referrer_idx on public.referral_rewards(referrer_user_id, created_at desc);

create or replace function public.get_or_create_referral_code()
returns text language plpgsql security definer set search_path=public as $$
declare uid uuid := auth.uid(); existing_code text; new_code text;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  select code into existing_code from public.referral_codes where user_id=uid;
  if existing_code is not null then return existing_code; end if;
  new_code := 'TS-' || upper(substr(replace(uid::text,'-',''),1,10));
  insert into public.referral_codes(user_id,code) values(uid,new_code)
  on conflict(user_id) do update set code=excluded.code;
  return new_code;
end; $$;

create or replace function public.record_referral_visit(p_code text, p_visitor_key text default null)
returns void language plpgsql security definer set search_path=public as $$
declare rid uuid;
begin
  select user_id into rid from public.referral_codes where upper(code)=upper(trim(p_code));
  if rid is not null then
    insert into public.referral_visits(referral_code,referrer_user_id,visitor_key)
    values(trim(p_code),rid,p_visitor_key);
  end if;
end; $$;

create or replace function public.record_referral_login(p_code text)
returns void language plpgsql security definer set search_path=public as $$
declare rid uuid; uid uuid := auth.uid();
begin
  if uid is null then return; end if;
  select user_id into rid from public.referral_codes where upper(code)=upper(trim(p_code));
  if rid is null or rid=uid then return; end if;
  insert into public.referrals(referral_code,referrer_user_id,referred_user_id,first_login_at)
  values(trim(p_code),rid,uid,now())
  on conflict(referred_user_id) do update
    set first_login_at=coalesce(public.referrals.first_login_at,excluded.first_login_at);
end; $$;

create or replace function public.create_referral_reward(
  p_source_type text,p_source_booking_id text,p_referred_user_id uuid,
  p_payment_amount numeric,p_platform_rate numeric
) returns void language plpgsql security definer set search_path=public as $$
declare rid uuid; commission numeric; reward numeric;
begin
  select referrer_user_id into rid from public.referrals where referred_user_id=p_referred_user_id limit 1;
  if rid is null or coalesce(p_payment_amount,0)<=0 then return; end if;
  commission:=round(p_payment_amount*p_platform_rate,2);
  reward:=round(commission*0.10,2);
  insert into public.referral_rewards(
    referrer_user_id,referred_user_id,source_type,source_booking_id,
    payment_amount,platform_commission_rate,platform_commission_amount,
    referral_reward_rate,referral_reward_amount
  ) values(rid,p_referred_user_id,p_source_type,p_source_booking_id,p_payment_amount,
           p_platform_rate,commission,0.10,reward)
  on conflict(source_type,source_booking_id) do nothing;
end; $$;

create or replace function public.trg_agency_referral_reward()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.status='paid' and coalesce(old.status,'')<>'paid' then
    perform public.create_referral_reward('agency_booking',new.id::text,new.customer_id,coalesce(new.total_price,0),0.15);
  end if;
  return new;
end; $$;

drop trigger if exists agency_referral_reward_trigger on public.bookings;
create trigger agency_referral_reward_trigger after update of status on public.bookings
for each row execute function public.trg_agency_referral_reward();

create or replace function public.trg_hotel_referral_reward()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.payment_status='paid' and coalesce(old.payment_status,'')<>'paid' then
    perform public.create_referral_reward('hotel_booking',new.id::text,new.customer_id,coalesce(new.total_amount,0),0.04);
  end if;
  return new;
end; $$;

drop trigger if exists hotel_referral_reward_trigger on public.hotel_bookings;
create trigger hotel_referral_reward_trigger after update of payment_status on public.hotel_bookings
for each row execute function public.trg_hotel_referral_reward();

alter table public.referral_codes enable row level security;
alter table public.referral_visits enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_rewards enable row level security;

drop policy if exists referral_codes_self_select on public.referral_codes;
create policy referral_codes_self_select on public.referral_codes for select to authenticated using(user_id=auth.uid());

drop policy if exists referrals_self_select on public.referrals;
create policy referrals_self_select on public.referrals for select to authenticated using(referrer_user_id=auth.uid() or referred_user_id=auth.uid());

drop policy if exists referral_rewards_self_select on public.referral_rewards;
create policy referral_rewards_self_select on public.referral_rewards for select to authenticated using(referrer_user_id=auth.uid());

create or replace view public.referral_dashboard_stats as
select r.referrer_user_id,
       count(distinct r.referred_user_id) as referred_users,
       count(rr.id) as paid_conversions,
       coalesce(sum(rr.payment_amount),0)::numeric(12,2) as referred_payment_volume,
       coalesce(sum(rr.platform_commission_amount),0)::numeric(12,2) as platform_commission_generated,
       coalesce(sum(rr.referral_reward_amount),0)::numeric(12,2) as referral_earnings
from public.referrals r
left join public.referral_rewards rr
  on rr.referrer_user_id=r.referrer_user_id and rr.referred_user_id=r.referred_user_id
group by r.referrer_user_id;
