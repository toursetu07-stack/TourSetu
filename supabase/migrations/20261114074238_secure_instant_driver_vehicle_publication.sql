-- New independent-driver listings are active immediately; KYC review remains separate.
ALTER TABLE public.driver_vehicles
  ALTER COLUMN status SET DEFAULT 'active';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.driver_vehicles'::regclass
      AND conname='driver_vehicles_status_allowed_check'
  ) THEN
    ALTER TABLE public.driver_vehicles
      ADD CONSTRAINT driver_vehicles_status_allowed_check
      CHECK (status IN ('active','inactive'));
  END IF;
END $$;
