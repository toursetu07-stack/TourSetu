-- New independent-driver listings are active immediately; KYC review remains separate.
ALTER TABLE public.driver_vehicles
  ALTER COLUMN status SET DEFAULT 'active',
  ALTER COLUMN status SET NOT NULL;
