# Security Policy

## Reporting a vulnerability

Please do not publish exploit details in a public issue.

Use GitHub's private vulnerability reporting for TourSetu when available, or contact the project maintainer privately with:
- the affected URL or repository path,
- a minimal reproduction,
- security impact,
- and the affected commit/version.

Do not include passwords, access tokens, Supabase secret keys, OneSignal REST keys, or other credentials in the report.

## Security baseline

TourSetu uses:
- Supabase Auth + Row Level Security for authorization;
- least-privilege Storage policies for user uploads;
- DOM-safe rendering and DOMPurify for the remaining legacy HTML paths;
- Cloudflare Pages security headers;
- automated frontend security regression checks.

Client-side checks are defense in depth only. Authorization must remain enforced by Supabase RLS/database logic and server-side Edge Functions.
