-- Allow the AFTER INSERT contact-capture trigger to clear the public phone
-- column only after the exact submitted number has been copied to the private
-- contact record. Customers still cannot replace or otherwise edit the phone.
CREATE OR REPLACE FUNCTION public.guard_hotel_booking_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  uid uuid := (select auth.uid());
  owner_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT h.owner_id
    INTO owner_id
  FROM public.room_categories rc
  JOIN public.hotels h ON h.hotel_id = rc.hotel_id
  WHERE rc.id = old.room_category_id;

  IF uid = old.customer_id THEN
    IF new.customer_id IS DISTINCT FROM old.customer_id
       OR new.room_category_id IS DISTINCT FROM old.room_category_id
       OR new.hotel_name IS DISTINCT FROM old.hotel_name
       OR new.room_type IS DISTINCT FROM old.room_type
       OR new.location IS DISTINCT FROM old.location
       OR new.check_in_date IS DISTINCT FROM old.check_in_date
       OR new.check_out_date IS DISTINCT FROM old.check_out_date
       OR new.rooms_booked IS DISTINCT FROM old.rooms_booked
       OR new.price_per_night IS DISTINCT FROM old.price_per_night
       OR new.total_nights IS DISTINCT FROM old.total_nights
       OR new.subtotal_amount IS DISTINCT FROM old.subtotal_amount
       OR new.gateway_fee IS DISTINCT FROM old.gateway_fee
       OR new.service_fee IS DISTINCT FROM old.service_fee
       OR new.total_amount IS DISTINCT FROM old.total_amount
       OR new.cancellation_policy_agreed IS DISTINCT FROM old.cancellation_policy_agreed
       OR new.customer_email IS DISTINCT FROM old.customer_email
       OR (
         new.customer_phone IS DISTINCT FROM old.customer_phone
         AND NOT (
           new.customer_phone IS NULL
           AND EXISTS (
             SELECT 1
             FROM private.hotel_booking_contacts c
             WHERE c.booking_id = old.id
               AND c.customer_phone = btrim(old.customer_phone)
           )
         )
       )
       OR new.payment_contact_number IS DISTINCT FROM old.payment_contact_number
       OR new.payment_instructions IS DISTINCT FROM old.payment_instructions
       OR new.approved_at IS DISTINCT FROM old.approved_at
       OR new.denied_at IS DISTINCT FROM old.denied_at
    THEN
      RAISE EXCEPTION 'Customers cannot modify protected hotel booking fields';
    END IF;

    IF new.booking_status IS DISTINCT FROM old.booking_status THEN
      IF new.booking_status = 'confirmed' AND old.booking_status NOT IN ('approved','confirmed') THEN
        RAISE EXCEPTION 'Hotel booking can be confirmed only after approval';
      END IF;
      IF new.booking_status = 'cancelled' AND old.booking_status NOT IN ('pending','approved','confirmed') THEN
        RAISE EXCEPTION 'Hotel booking cannot be cancelled from its current state';
      END IF;
      IF new.booking_status NOT IN ('cancelled','confirmed') THEN
        RAISE EXCEPTION 'Invalid customer hotel booking status transition';
      END IF;
    END IF;

    IF new.payment_status IS DISTINCT FROM old.payment_status
       AND NOT (new.payment_status = 'paid' AND old.booking_status IN ('approved','confirmed')) THEN
      RAISE EXCEPTION 'Invalid customer hotel payment status transition';
    END IF;

  ELSIF uid = owner_id THEN
    IF new.customer_id IS DISTINCT FROM old.customer_id
       OR new.room_category_id IS DISTINCT FROM old.room_category_id
       OR new.hotel_name IS DISTINCT FROM old.hotel_name
       OR new.room_type IS DISTINCT FROM old.room_type
       OR new.location IS DISTINCT FROM old.location
       OR new.check_in_date IS DISTINCT FROM old.check_in_date
       OR new.check_out_date IS DISTINCT FROM old.check_out_date
       OR new.rooms_booked IS DISTINCT FROM old.rooms_booked
       OR new.price_per_night IS DISTINCT FROM old.price_per_night
       OR new.total_nights IS DISTINCT FROM old.total_nights
       OR new.subtotal_amount IS DISTINCT FROM old.subtotal_amount
       OR new.gateway_fee IS DISTINCT FROM old.gateway_fee
       OR new.service_fee IS DISTINCT FROM old.service_fee
       OR new.total_amount IS DISTINCT FROM old.total_amount
       OR new.cancellation_policy_agreed IS DISTINCT FROM old.cancellation_policy_agreed
       OR new.customer_email IS DISTINCT FROM old.customer_email
       OR new.customer_phone IS DISTINCT FROM old.customer_phone
       OR new.payment_status IS DISTINCT FROM old.payment_status THEN
      RAISE EXCEPTION 'Hotel owners cannot modify protected hotel booking fields';
    END IF;

    IF new.booking_status IS DISTINCT FROM old.booking_status
       AND NOT (old.booking_status = 'pending' AND new.booking_status IN ('approved','denied')) THEN
      RAISE EXCEPTION 'Invalid hotel owner booking status transition';
    END IF;

  ELSE
    RAISE EXCEPTION 'You are not allowed to modify this hotel booking';
  END IF;

  RETURN new;
END;
$function$;
