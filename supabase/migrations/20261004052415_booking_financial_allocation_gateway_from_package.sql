-- TourSetu booking financial allocation
-- Gateway fee + GST are deducted from the customer's package payment,
-- not from the TourSetu platform commission.
-- Provider payout excludes gateway deduction and platform commission.
-- Referral reward is paid from TourSetu's platform commission.

alter table private.booking_financials
  add column if not exists gateway_total_deduction_amount numeric not null default 0,
  add column if not exists net_amount_after_gateway numeric not null default 0,
  add column if not exists platform_commission_after_referral_amount numeric not null default 0,
  add column if not exists allocation_difference numeric not null default 0;

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
set search_path to ''
as $function$
declare
  v_gateway_rate numeric := 0.02;
  v_gateway_gst_rate numeric := 0.18;
  v_referral_rate numeric := 0.10;
  v_customer_paid numeric := round(coalesce(p_customer_amount_paid, 0), 2);
  v_gateway_fee numeric;
  v_gateway_gst numeric;
  v_gateway_total numeric;
  v_net_after_gateway numeric;
  v_commission numeric;
  v_provider_payout numeric;
  v_referrer uuid;
  v_referrer_contact text;
  v_provider_contact text;
  v_referral_reward numeric := 0;
  v_platform_retained numeric;
  v_allocation_difference numeric;
begin
  if p_source_type not in ('agency_booking','hotel_booking') then
    raise exception 'Invalid booking financial source type';
  end if;

  if v_customer_paid < 0 then
    raise exception 'Customer payment cannot be negative';
  end if;

  if coalesce(p_platform_commission_rate, 0) < 0
     or coalesce(p_platform_commission_rate, 0) > 1 then
    raise exception 'Invalid platform commission rate';
  end if;

  v_gateway_fee := round(v_customer_paid * v_gateway_rate, 2);
  v_gateway_gst := round(v_gateway_fee * v_gateway_gst_rate, 2);
  v_gateway_total := round(v_gateway_fee + v_gateway_gst, 2);
  v_net_after_gateway := round(v_customer_paid - v_gateway_total, 2);
  v_commission := round(v_customer_paid * p_platform_commission_rate, 2);

  -- Gateway fee + GST come out of the customer's payment.
  -- The provider payout is calculated after both gateway deduction and platform commission.
  v_provider_payout := round(v_customer_paid - v_gateway_total - v_commission, 2);

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

    -- Referral reward is 10% of TourSetu's platform commission.
    v_referral_reward := round(v_commission * v_referral_rate, 2);
  end if;

  select p.phone
    into v_provider_contact
  from public.profiles p
  where p.id = p_provider_user_id;

  -- TourSetu keeps its platform commission after paying the referral reward.
  v_platform_retained := round(v_commission - v_referral_reward, 2);

  v_allocation_difference := round(
    v_customer_paid
      - v_gateway_total
      - v_provider_payout
      - v_platform_retained
      - v_referral_reward,
    2
  );

  if v_allocation_difference <> 0 then
    raise exception 'Booking financial allocation does not balance';
  end if;

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
    gateway_total_deduction_amount,
    net_amount_after_gateway,
    platform_commission_rate,
    platform_commission_amount,
    provider_payout_amount,
    provider_payout_contact_number,
    referrer_user_id,
    referrer_contact_number,
    referral_reward_rate,
    referral_reward_amount,
    platform_retained_amount,
    platform_commission_after_referral_amount,
    allocation_difference,
    payment_status,
    calculated_at,
    updated_at
  )
  values (
    p_source_type,
    p_source_booking_id,
    p_customer_id,
    p_provider_user_id,
    v_customer_paid,
    v_gateway_rate,
    v_gateway_fee,
    v_gateway_gst_rate,
    v_gateway_gst,
    v_gateway_total,
    v_net_after_gateway,
    p_platform_commission_rate,
    v_commission,
    v_provider_payout,
    v_provider_contact,
    v_referrer,
    v_referrer_contact,
    v_referral_rate,
    v_referral_reward,
    v_platform_retained,
    v_platform_retained,
    v_allocation_difference,
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
    gateway_total_deduction_amount = excluded.gateway_total_deduction_amount,
    net_amount_after_gateway = excluded.net_amount_after_gateway,
    platform_commission_rate = excluded.platform_commission_rate,
    platform_commission_amount = excluded.platform_commission_amount,
    provider_payout_amount = excluded.provider_payout_amount,
    provider_payout_contact_number = excluded.provider_payout_contact_number,
    referrer_user_id = excluded.referrer_user_id,
    referrer_contact_number = excluded.referrer_contact_number,
    referral_reward_rate = excluded.referral_reward_rate,
    referral_reward_amount = excluded.referral_reward_amount,
    platform_retained_amount = excluded.platform_retained_amount,
    platform_commission_after_referral_amount = excluded.platform_commission_after_referral_amount,
    allocation_difference = excluded.allocation_difference,
    payment_status = 'paid',
    updated_at = timezone('utc', now());

  insert into public.referral_rewards (
    referrer_user_id,
    referred_user_id,
    source_type,
    source_booking_id,
    payment_amount,
    platform_commission_rate,
    platform_commission_amount,
    referral_reward_rate,
    referral_reward_amount,
    status
  )
  select
    v_referrer,
    p_customer_id,
    p_source_type,
    p_source_booking_id,
    v_customer_paid,
    p_platform_commission_rate,
    v_commission,
    v_referral_rate,
    v_referral_reward,
    'pending'
  where v_referrer is not null
  on conflict (source_type, source_booking_id)
  do update set
    referrer_user_id = excluded.referrer_user_id,
    referred_user_id = excluded.referred_user_id,
    payment_amount = excluded.payment_amount,
    platform_commission_rate = excluded.platform_commission_rate,
    platform_commission_amount = excluded.platform_commission_amount,
    referral_reward_rate = excluded.referral_reward_rate,
    referral_reward_amount = excluded.referral_reward_amount;
end;
$function$;
