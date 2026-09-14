# Security model

How Job·Agent protects its users — and the honest boundaries of that protection.

## Core principle

> **The agent cannot do anything irreversible without a recorded human approval.**

| Surface | Control |
| --- | --- |
| Email sending | State machine: `DRAFT → CONFIRMATION_REQUIRED → APPROVED → SENT`. The `SENT` transition is a separate endpoint requiring an explicit click. |
| Daily volume | `MAX_EMAILS_PER_DAY` hard cap (default 10) enforced server-side; duplicate applications blocked by a DB unique constraint. |
| Autofill | Headed (visible) browser, human confirmation before submit, never clicks final submit buttons, poll-and-timeout session model. |
| Master switch | `DRY_RUN=true` default — every outbound action becomes a simulated, logged no-op. One toggle in Settings re-enables it. |
| Resume integrity | Frozen fields (education, dates, employers, skill whitelist) enforced server-side; LLM output is diffed and hallucinated additions stripped before storage. |

## Transport & headers

- **TLS** terminates at your reverse proxy (Caddy/Nginx — setup in [DEPLOYMENT.md](DEPLOYMENT.md)). In `ENVIRONMENT=production` the API sends `Strict-Transport-Security: max-age=63072000; includeSubDomains`.
- **API responses** always include `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geolocation off).
- **Next.js** sets the equivalent header set plus long-lived immutable caching for static assets, and disables the `X-Powered-By` header.

## Rate limiting & abuse resistance

- slowapi keyed by client IP: default `120/minute` (`RATE_LIMIT_DEFAULT`), `429` with a handler beyond that.
- The newsletter opt-in endpoint is idempotent per email and validates format server-side — no enumeration or spam amplification.
- CORS is an explicit allow-list (`CORS_ORIGINS`) with credentials enabled — never `*`.

## Authentication

- Auth.js v5, JWT sessions, `HttpOnly` cookies; `Secure` is automatic behind HTTPS.
- OAuth only: we receive name/email/avatar from Google/GitHub. Passwords never touch the app.
- Route protection via middleware (`AUTH_ENFORCED=true`) for all console pages.

## Secrets handling

- All secrets live in environment files that are **gitignored** (`.env`, `frontend/.env.local`). `.env.example` documents every key with no real values.
- Never commit: `AUTH_SECRET`, OAuth client secrets, `GMAIL_APP_PASSWORD`, LLM API keys. If one leaks, rotate it at the provider and redeploy.
- For production, prefer a secrets manager or your platform's encrypted env store over raw `.env` files.

## Data footprint

- Workspace data (resumes, applications, drafts, logs) lives in **your** PostgreSQL instance in self-hosted mode.
- Optional LLM providers receive resume text + job descriptions only for the tailoring/drafting calls you trigger. Point `LLM_PROVIDER=ollama` to keep that traffic on your machine.
- No analytics, no ad cookies, no third-party trackers (see the in-app Privacy Policy).

## Reporting a vulnerability

Email **security@jobagent.app** (see `frontend/lib/site.ts` for the current address) with reproduction steps. Please do not open public issues for exploitable bugs. We aim to acknowledge within 72 hours.

## Known limitations (be honest with yourself)

- Scraping connectors depend on third-party sites; a compromised or hostile page is parsed, never executed — but treat scraper output as untrusted input regardless.
- OAuth session JWTs are stateful-ish: rotating `AUTH_SECRET` is your revocation lever.
- Self-hosted security is *your* configuration: keep TLS on, patch the VM, back up, and don't expose PostgreSQL to the internet.
