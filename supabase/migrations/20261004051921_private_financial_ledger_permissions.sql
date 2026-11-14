-- The accounting ledger lives in the non-exposed private schema.
-- Keep Data API roles blocked by grants; RLS is unnecessary here and would
-- create a misleading "RLS enabled without policy" advisor finding.

alter table private.booking_financials disable row level security;

revoke usage on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

revoke all on table private.booking_financials from public, anon, authenticated;
grant all on table private.booking_financials to service_role;
