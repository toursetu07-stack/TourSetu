-- Tighten permissions for agency verification SECURITY DEFINER functions.
-- Trigger-only functions must not be callable through the public RPC API.

revoke execute on function public.create_agency_verification_request() from public, anon, authenticated;
revoke execute on function public.sync_agency_approval() from public, anon, authenticated;

revoke execute on function public.save_agency_verification_documents(
  text,text,text,text,text,text,text,text,text,text,text,text
) from public, anon;

grant execute on function public.save_agency_verification_documents(
  text,text,text,text,text,text,text,text,text,text,text,text
) to authenticated;
