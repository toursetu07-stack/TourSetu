-- Idempotent indexes for customer search and driver/customer request dashboards.
CREATE INDEX IF NOT EXISTS driver_vehicles_driver_idx
  ON public.driver_vehicles (driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_vehicles_active_city
  ON public.driver_vehicles (status, driver_city);
CREATE INDEX IF NOT EXISTS idx_driver_vehicles_driver_created
  ON public.driver_vehicles (driver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS driver_requests_customer_idx
  ON public.driver_service_requests (customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS driver_requests_driver_status_idx
  ON public.driver_service_requests (driver_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_service_requests_customer_created
  ON public.driver_service_requests (customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_service_requests_driver_created
  ON public.driver_service_requests (driver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_service_requests_vehicle
  ON public.driver_service_requests (vehicle_id);
