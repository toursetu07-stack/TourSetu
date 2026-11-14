-- Secure booking financial breakdown for TourSetu
-- Keeps customer-paid, provider payout, platform retention and referral payout
-- in a private schema so customers/partners cannot read or alter internal accounting.

create schema if not exists private;

create table if not exists private.booking_financials (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('agency_booking','hotel_booking')),
  source_booking_id text not null,
  customer_id uuid not null references auth.users(id) on delete cascade,
  provider_user_id uuid references auth.users(id) on delete set null,

  customer_amount_paid numeric(12,2) not null default 0 check (customer_amount_paid >= 0),

  gateway_fee_rate numeric(8,6) not null default 0.020000 check (gateway_fee_rate >= 0),
  gateway_fee_amount numeric(12,2) not null default 0 check (gateway_fee_amount >= 0),
  gateway_fee_gst_rate numeric(8,6) not null default 0.180000 check (gateway_fee_gst_rate >= 0),
  gateway_fee_gst_amount numeric(12,2) not null default 0 check (gateway_fee_gst_amount >= 0),

  platform_commission_rate numeric(8,6) not null check (platform_commission_rate >= 0),
  platform_commission_amount numeric(12,2) not null default 0 check (platform_commission_amount >= 0),

  provider_payout_amount numeric(12,2) not null default 0 check (provider_payout_amount >= 0),
  provider_payout_contact_number text,

  referrer_user_id uuid references auth.users(id) on delete set null,
  referrer_contact_number text,
  referral_reward_rate numeric(8,6) not null default 0.100000 check (referral_reward_rate >= 0),
  referral_reward_amount numeric(12,2) not null default 0 check (referral_reward_amount >= 0),

  platform_retained_amount numeric(12,2) not null default 0,

  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','partially_paid','refunded','failed')),
  provider_payout_status text not null default 'pending'
    check (provider_payout_status in ('pending','paid','held','cancelled')),
  referral_payout_status text not null default 'pending'
    check (referral_payout_status in ('pending','paid','held','cancelled')),

  calculated_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  unique (source_type, source_booking_id)
);

alter table private.booking_financials enable row level security;

-- Internal accounting is not exposed to customer/agency/hotel roles.
revoke all on table private.booking_financials from public, anon, authenticated;
grant all on table private.booking_financials to service_role;

create index if not exists booking_financials_customer_idx
  on private.booking_financials(customer_id);
create index if not exists booking_financials_provider_idx
  on private.booking_financials(provider_user_id);
create index if not exists booking_financials_referrer_idx
  on private.booking_financials(referrer_user_id);
create index if not exists booking_financials_payment_status_idx
  on private.booking_financials(payment_status);

create or replace function private.calculate_booking_financials(
  p_source_type text,
  p_source_booking_id text,
  p_customer_id uuid,
  p_provider_user_id uuid,
  p_customer_amount_paid numeric,
  p_platform_commission_rate numeric
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_gateway_rate numeric := 0.02;
  v_gateway_gst_rate numeric := 0.18;
  v_referral_rate numeric := 0.10;
  v_gateway_fee numeric;
  v_gateway_gst numeric;
  v_commission numeric;
  v_provider_payout numeric;
  v_referrer uuid;
  v_referrer_contact text;
  v_provider_contact text;
  v_referral_reward numeric := 0;
  v_platform_retained numeric;
begin
  if p_source_type not in ('agency_booking','hotel_booking') then
    raise exception 'Invalid booking financial source type';
  end if;

  if coalesce(p_customer_amount_paid, 0) < 0 then
    raise exception 'Customer payment cannot be negative';
  end if;

  if p_platform_commission_rate < 0 then
    raise exception 'Platform commission rate cannot be negative';
  end if;

  v_gateway_fee := round(coalesce(p_customer_amount_paid, 0) * v_gateway_rate, 2);
  v_gateway_gst := round(v_gateway_fee * v_gateway_gst_rate, 2);
  v_commission := round(coalesce(p_customer_amount_paid, 0) * p_platform_commission_rate, 2);
  v_provider_payout := round(coalesce(p_customer_amount_paid, 0) - v_commission, 2);

  select r.referrer_user_id
    into v_referrer
  from public.referrals r
  where r.referred_user_id = p_customer_id
  order by r.created_at asc
  limit 1;

  if v_referrer is not null then
    select p.phone
      into v_referrer_contact
    from public.profiles p
    where p.id = v_referrer;

    v_referral_reward := round(v_commission * v_referral_rate, 2);
  end if;

  select p.phone
    into v_provider_contact
  from public.profiles p
  where p.id = p_provider_user_id;

  v_platform_retained := round(
    v_commission - v_gateway_fee - v_gateway_gst - v_referral_reward,
    2
  );

  insert into private.booking_financials (
    source_type,
    source_booking_id,
    customer_id,
    provider_user_id,
    customer_amount_paid,
    gateway_fee_rate,
    gateway_fee_amount,
    gateway_fee_gst_rate,
    gateway_fee_gst_amount,
    platform_commission_rate,
    platform_commission_amount,
    provider_payout_amount,
    provider_payout_contact_number,
    referrer_user_id,
    referrer_contact_number,
    referral_reward_rate,
    referral_reward_amount,
    platform_retained_amount,
    payment_status,
    calculated_at,
    updated_at
  )
  values (
    p_source_type,
    p_source_booking_id,
    p_customer_id,
    p_provider_user_id,
    round(coalesce(p_customer_amount_paid, 0), 2),
    v_gateway_rate,
    v_gateway_fee,
    v_gateway_gst_rate,
    v_gateway_gst,
    p_platform_commission_rate,
    v_commission,
    v_provider_payout,
    v_provider_contact,
    v_referrer,
    v_referrer_contact,
    v_referral_rate,
    v_referral_reward,
    v_platform_retained,
    'paid',
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (source_type, source_booking_id)
  do update set
    customer_id = excluded.customer_id,
    provider_user_id = excluded.provider_user_id,
    customer_amount_paid = excluded.customer_amount_paid,
    gateway_fee_rate = excluded.gateway_fee_rate,
    gateway_fee_amount = excluded.gateway_fee_amount,
    gateway_fee_gst_rate = excluded.gateway_fee_gst_rate,
    gateway_fee_gst_amount = excluded.gateway_fee_gst_amount,
    platform_commission_rate = excluded.platform_commission_rate,
    platform_commission_amount = excluded.platform_commission_amount,
    provider_payout_amount = excluded.provider_payout_amount,
    provider_payout_contact_number = excluded.provider_payout_contact_number,
    referrer_user_id = excluded.referrer_user_id,
    referrer_contact_number = excluded.referrer_contact_number,
    referral_reward_rate = excluded.referral_reward_rate,
    referral_reward_amount = excluded.referral_reward_amount,
    platform_retained_amount = excluded.platform_retained_amount,
    payment_status = 'paid',
    updated_at = timezone('utc', now());
end;
$$;

revoke execute on function private.calculate_booking_financials(
  text, text, uuid, uuid, numeric, numeric
) from public, anon, authenticated;
grant execute on function private.calculate_booking_financials(
  text, text, uuid, uuid, numeric, numeric
) to service_role;

create or replace function public.sync_agency_booking_financials()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'paid' and coalesce(old.status, '') <> 'paid' then
    perform private.calculate_booking_financials(
      'agency_booking',
      new.id::text,
      new.customer_id,
      new.agency_id,
      coalesce(new.total_price, 0),
      0.15
    );
  end if;
  return new;
end;
$$;

create or replace function public.sync_hotel_booking_financials()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner_id uuid;
begin
  if new.payment_status = 'paid' and coalesce(old.payment_status, '') <> 'paid' then
    select h.owner_id
      into v_owner_id
    from public.room_categories rc
    join public.hotels h on h.hotel_id = rc.hotel_id
    where rc.id = new.room_category_id;

    perform private.calculate_booking_financials(
      'hotel_booking',
      new.id::text,
      new.customer_id,
      v_owner_id,
      coalesce(new.total_amount, 0),
      0.04
    );
  end if;
  return new;
end;
$$;

drop trigger if exists sync_agency_booking_financials on public.bookings;
create trigger sync_agency_booking_financials
after update of status on public.bookings
for each row
execute function public.sync_agency_booking_financials();

drop trigger if exists sync_hotel_booking_financials on public.hotel_bookings;
create trigger sync_hotel_booking_financials
after update of payment_status on public.hotel_bookings
for each row
execute function public.sync_hotel_booking_financials();

revoke execute on function public.sync_agency_booking_financials() from public, anon, authenticated;
revoke execute on function public.sync_hotel_booking_financials() from public, anon, authenticated;

comment on table private.booking_financials is
'Private TourSetu accounting ledger: customer payment, gateway cost, provider payout, platform retained amount and referral reward. Populated by trusted database triggers; not exposed to customers, agencies or hotels.';
comment on column private.booking_financials.customer_amount_paid is
'Actual amount recorded as paid for the booking. Until a payment gateway webhook writes a captured amount, this is derived from the booking total when payment status becomes paid.';
comment on column private.booking_financials.platform_retained_amount is
'Net TourSetu retention after platform commission less gateway fee, GST on gateway fee, and referral reward.';
comment on column private.booking_financials.provider_payout_contact_number is
'Provider phone/contact number currently stored in profiles and used for payout reconciliation; replace with verified payout-bank destination when payout rails are implemented.';
comment on column private.booking_financials.referrer_contact_number is
'Referrer contact number copied from profiles for internal referral payout reconciliation; never exposed to other customers.';
