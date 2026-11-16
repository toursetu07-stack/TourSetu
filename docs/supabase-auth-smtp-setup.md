# TourSetu — Supabase Auth SMTP setup

This repository intentionally does **not** contain SMTP credentials. Configure them in the hosted Supabase Auth settings so secrets never enter browser JavaScript, Git history, or Netlify's public assets.

## 1. Verify a transactional email sender

Use a transactional provider that supports SMTP (for example Resend, Postmark, Brevo, Amazon SES, or SendGrid).

1. Add and verify a sending domain with the provider. Prefer a dedicated auth subdomain such as `auth.toursetu.in`.
2. Publish the provider's exact SPF and DKIM DNS records in Cloudflare. Add a DMARC record after confirming the provider's instructions.
3. Create an SMTP credential/API key with mail-sending permission only.
4. Use a sender address on the verified domain, for example `no-reply@auth.toursetu.in`. Do not use a Gmail personal mailbox as the production sender.

## 2. Configure Supabase SMTP

Project: `udfwcqrmksfyeigxgdws`

In Supabase Dashboard, open **Authentication → Settings → SMTP Settings** (the Authentication settings page), enable **Custom SMTP**, and enter the values supplied by your provider:

- Sender email: the verified sender, e.g. `no-reply@auth.toursetu.in`
- Sender name: `TourSetu`
- Host: provider SMTP hostname
- Port: provider-supported TLS port (usually `587` for STARTTLS; use the provider's exact recommendation)
- Username: provider SMTP username
- Password: provider SMTP password/API key

Save the settings. Keep the SMTP password only in Supabase's secret configuration. Never add it to `script.js`, `signin.html`, `supabase-config`, GitHub Actions logs, or Netlify environment variables.

## 3. Auth URL configuration

In **Authentication → URL Configuration**:

- Site URL: `https://toursetu.in`
- Add redirect URL: `https://toursetu.in/signin`
- If the site is intentionally served on the www host too, add `https://www.toursetu.in/signin` as a separate allowlisted URL.

Do not use a wildcard redirect for production.

Keep **Confirm email** enabled. Do not disable email verification to work around delivery failures.

## 4. Email templates

In **Authentication → Email Templates**, set the confirmation template:

**Subject:** Confirm your TourSetu email

```html
<h2>Confirm your TourSetu email</h2>
<p>Thanks for creating a TourSetu account. Confirm your email address to activate sign-in.</p>
<p><a href="{{ .ConfirmationURL }}">Confirm email address</a></p>
<p>If you did not create this account, you can ignore this email.</p>
```

Set the password recovery template:

**Subject:** Reset your TourSetu password

```html
<h2>Reset your TourSetu password</h2>
<p>We received a request to reset your TourSetu account password.</p>
<p><a href="{{ .ConfirmationURL }}">Choose a new password</a></p>
<p>If you did not request this, you can safely ignore this email.</p>
```

The app uses Supabase's supported `{{ .ConfirmationURL }}` variable. Keep links short and do not add marketing trackers that rewrite authentication links.

## 5. Implemented website flows

- Signup calls `auth.signUp` with `emailRedirectTo: https://toursetu.in/signin`.
- Login detects an unconfirmed email and provides **Resend Confirmation Email**.
- Forgot Password calls `auth.resetPasswordForEmail` with the same allowlisted redirect.
- Recovery handles Supabase recovery metadata in either the URL query or fragment, then uses `auth.updateUser({ password })`.
- Recovery links are one-time/expiring. If expired, the user is told to request a new email.
- Password minimum is 8 characters and the confirmation field must match.
- No SMTP credentials or privileged Supabase keys are shipped to the browser.

## 6. Production verification checklist

After SMTP is configured, test with an external mailbox that is not a Supabase organization member:

1. Register a new customer email. Confirm that a TourSetu-branded email arrives and its link returns to `https://toursetu.in/signin`.
2. Confirm the account can log in only after email verification.
3. Use **Resend Confirmation Email** on an unconfirmed account and verify delivery.
4. Use **Forgot Password?**, open the email on the same browser, set a new password, and verify login with the new password.
5. Re-open the same recovery link and confirm it cannot be reused.
6. Check Supabase Auth logs and provider delivery/bounce logs. Check spam placement and SPF/DKIM/DMARC alignment.

The SMTP host, port, username, password, and sender identity must be supplied by the selected email provider and saved in the Supabase Dashboard. They cannot be inferred from the repository.
