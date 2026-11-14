-- Keep Hotel Partners visible in public.profiles and let profile approval
-- fields control the linked hotel's public visibility.
--
-- Live migration applied on 2026-10-02.

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role = ANY (ARRAY['customer'::text, 'agency'::text, 'hotel'::text]));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hotel_id uuid,
  ADD COLUMN IF NOT EXISTS hotel_name text;

CREATE OR REPLACE FUNCTION public.sync_hotel_profile_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');

  INSERT INTO public.profiles (
    id, email, role, approval_status, is_approved, updated_at
  )
  VALUES (
    NEW.id, NEW.email, v_role, 'pending', false, now()
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      role = CASE
        WHEN public.profiles.role = 'hotel' THEN 'hotel'
        ELSE EXCLUDED.role
      END,
      updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_sync_profile ON auth.users;

CREATE TRIGGER on_auth_user_created_sync_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_hotel_profile_from_auth();

CREATE OR REPLACE FUNCTION public.sync_hotel_approval_from_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_approved boolean;
BEGIN
  IF NEW.role = 'hotel' THEN
    v_approved := COALESCE(NEW.is_approved, false)
      OR COALESCE(NEW.approval_status, 'pending') = 'approved';

    UPDATE public.hotels
    SET status = CASE WHEN v_approved THEN 'active' ELSE 'inactive' END,
        hide_from_search = NOT v_approved
    WHERE owner_id = NEW.id;

    UPDATE public.hotel_verification_requests
    SET status = CASE
          WHEN v_approved THEN 'approved'
          WHEN COALESCE(NEW.approval_status, 'pending') = 'denied' THEN 'denied'
          ELSE 'pending'
        END,
        reviewed_at = CASE
          WHEN v_approved OR COALESCE(NEW.approval_status, 'pending') = 'denied'
          THEN COALESCE(reviewed_at, now())
          ELSE NULL
        END,
        updated_at = now()
    WHERE user_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_hotel_profile_approval_sync ON public.profiles;

CREATE TRIGGER on_hotel_profile_approval_sync
AFTER INSERT OR UPDATE OF approval_status, is_approved, role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_hotel_approval_from_profile();

-- Backfill existing Hotel Partners into public.profiles.
INSERT INTO public.profiles (
  id, email, role, approval_status, is_approved, hotel_id, hotel_name, updated_at
)
SELECT
  h.owner_id,
  u.email,
  'hotel',
  CASE WHEN h.status = 'active' AND COALESCE(h.hide_from_search, false) = false
       THEN 'approved' ELSE 'pending' END,
  CASE WHEN h.status = 'active' AND COALESCE(h.hide_from_search, false) = false
       THEN true ELSE false END,
  h.hotel_id,
  h.hotel_name,
  now()
FROM public.hotels h
JOIN auth.users u ON u.id = h.owner_id
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    role = 'hotel',
    approval_status = EXCLUDED.approval_status,
    is_approved = EXCLUDED.is_approved,
    hotel_id = EXCLUDED.hotel_id,
    hotel_name = EXCLUDED.hotel_name,
    updated_at = now();

UPDATE public.profiles p
SET hotel_id = h.hotel_id,
    hotel_name = h.hotel_name,
    role = 'hotel',
    approval_status = CASE
      WHEN h.status = 'active' AND COALESCE(h.hide_from_search, false) = false
      THEN 'approved' ELSE 'pending' END,
    is_approved = CASE
      WHEN h.status = 'active' AND COALESCE(h.hide_from_search, false) = false
      THEN true ELSE false END,
    updated_at = now()
FROM public.hotels h
WHERE h.owner_id = p.id;
