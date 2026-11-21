-- Persist the agency-defined daily tour departure time for each package.
-- Safe to run more than once.
ALTER TABLE public.packages
    ADD COLUMN IF NOT EXISTS start_tour_timing time without time zone;

COMMENT ON COLUMN public.packages.start_tour_timing IS
    'Agency-entered daily tour departure time, shown in customer package details.';
