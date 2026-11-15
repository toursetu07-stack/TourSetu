# Step 2 security rollout notes

## Admin allowlist: add the intended account manually

The production schema has `public.toursetu_admin_users(user_id uuid primary key, created_at timestamptz)`. The migration deliberately does not guess which Auth account belongs to the site owner.

1. Sign in to the intended TourSetu admin account.
2. In Supabase Dashboard → Authentication → Users, copy that account's immutable User UID.
3. Run this in the SQL Editor, replacing the placeholder with that exact UUID:

```sql
INSERT INTO public.toursetu_admin_users (user_id)
VALUES ('<AUTH_USER_UUID>'::uuid)
ON CONFLICT (user_id) DO NOTHING;
```

4. Verify:

```sql
SELECT user_id, created_at
FROM public.toursetu_admin_users
WHERE user_id = '<AUTH_USER_UUID>'::uuid;
```

Do not use an email address, editable user metadata, or a guessed UUID. Only a trusted project owner should execute this allowlist change.

## RLS behavior

- Taxi contact SELECT is limited to the request's customer or assigned driver.
- An INSERT policy is defined for those same parties, but direct browser INSERT remains intentionally ungranted because the existing trusted RPC/trigger captures both phone numbers. This avoids letting either party overwrite the other party's private contact field.
- `services` is publicly readable by `anon` and `authenticated`, with no browser-role write grants.
- `private.hotel_booking_contacts` is untouched.

## CSP rollout

All executable inline script blocks found in the HTML pages were moved to same-origin external JavaScript. CSP is switched to enforcement and `require-trusted-types-for 'script'` is removed for now. The allowlist includes the currently referenced Supabase, OneSignal, Razorpay, Google Fonts, jsDelivr, OpenStreetMap/OSRM, Unsplash and Pexels origins. Verify authentication, driver dashboard, public navigation/contact demo, hotel/agency dashboards, OneSignal and Razorpay checkout in the deploy preview before merge.
