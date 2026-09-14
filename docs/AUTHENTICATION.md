# Authentication — Google & GitHub sign-in

Job·Agent uses **Auth.js v5 (NextAuth)** with passwordless OAuth. This guide takes you from zero to a working sign-in page in ~10 minutes.

---

## 1. Generate the session secret (required)

```bash
openssl rand -base64 32
```

Put it in `frontend/.env.local`:

```env
AUTH_SECRET=<the generated value>
```

Without this, sessions cannot be encrypted and sign-in will fail.

## 2. Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create (or pick) a project.
2. **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name: `Job·Agent`, add your support email
   - Scopes: `email`, `profile`, `openid` (defaults)
   - Add yourself as a **Test user** while in testing mode.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - (production) `https://your-domain.com/api/auth/callback/google`
4. Copy the **Client ID** and **Client secret** into `frontend/.env.local`:

```env
AUTH_GOOGLE_ID=xxxxxxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=xxxxxxx
```

## 3. GitHub OAuth

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**
2. Fill in:
   - Application name: `Job·Agent`
   - Homepage URL: `http://localhost:3000` (or your domain)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
     (production: `https://your-domain.com/api/auth/callback/github`)
3. **Generate a new client secret**, then copy both values:

```env
AUTH_GITHUB_ID= Iv1.xxxxxxxx
AUTH_GITHUB_SECRET=xxxxxxx
```

## 4. Restart and verify

```bash
cd frontend && npm run dev
```

- Visit `/login` — both buttons should be enabled (unconfigured providers are shown with a setup hint).
- Sign in → you land on `/dashboard`.
- API routes live at `/api/auth/[...nextauth]` — the handlers in `frontend/app/api/auth/[...nextauth]/route.ts`.

> Using placeholder values (`paste-your-...`) counts as *not configured* — the login page detects this and shows the hint box.

## 5. Route protection (on by default)

**Authentication is required to use the product.** All console pages (dashboard, jobs, applications, resume studio, resume builder, recruiters, settings, autofill review, onboarding) redirect unauthenticated visitors to `/login` via `frontend/middleware.ts`, preserving the intended destination as `?callbackUrl=`.

This is controlled by `AUTH_ENFORCED` in `frontend/.env.local`:

```env
AUTH_ENFORCED=true    # default — login required
AUTH_ENFORCED=false   # local development without OAuth credentials only
```

After a first successful sign-in, new users are routed through the onboarding wizard (`/onboarding`) before the dashboard — it saves a personalization profile to `POST /api/v1/profile` (target roles, locations, weekly goal).

## 6. Session behavior

| Concern | Behavior |
| --- | --- |
| Strategy | JWT sessions (no database sessions needed) |
| Cookie | `authjs.session-token`, `HttpOnly`, `SameSite=Lax`, auto `Secure` behind HTTPS |
| Sign out | Header button → `signOut()` → returns to landing page |
| Trust host | `trustHost: true` — required behind proxies; keep TLS on |

## 7. Production checklist

- [ ] `AUTH_SECRET` set on the server (a **different** strong value than dev is fine; changing it invalidates sessions)
- [ ] Both providers' redirect URIs updated to `https://your-domain.com/...`
- [ ] Google OAuth consent screen moved to **In production** (removes test-user limits)
- [ ] `NEXT_PUBLIC_SITE_URL=https://your-domain.com`
- [ ] `AUTH_ENFORCED=true`
- [ ] Site served over HTTPS (see [DEPLOYMENT.md](DEPLOYMENT.md)) — OAuth providers require secure redirects in production

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| `UntrustedHost` error | Set `trustHost: true` (already default here) and check the `Host` header passthrough on your proxy |
| `redirect_uri_mismatch` (Google) | Redirect URI in console doesn't match exactly — scheme, host, port, path |
| `The redirect_uri MUST match...` (GitHub) | Callback URL mismatch — must be the full `.../api/auth/callback/github` |
| Buttons disabled on `/login` | Provider env vars missing or still placeholder values |
| Signed out after deploy | `AUTH_SECRET` changed or missing in the deployment environment |
