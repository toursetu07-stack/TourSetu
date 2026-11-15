-- Lock down request INSERT columns after the payment-gated contact migration was applied.
-- The client may create a request but must never be able to assert payment success.
revoke insert on public.driver_service_requests from authenticated;
grant insert (customer_id, driver_id, vehicle_id, status, trip_details)
  on public.driver_service_requests to authenticated;
