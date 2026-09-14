# Job·Agent — Frontend

Next.js 16 (App Router) + React 19 + Tailwind CSS v4 console and marketing site for Job·Agent.

## Stack

| Piece | Choice |
| --- | --- |
| Framework | Next.js 16, App Router, Turbopack |
| Auth | Auth.js v5 (`next-auth` beta) — Google + GitHub OAuth |
| Styling | Tailwind v4 + small custom design system in `app/globals.css` |
| 3D | three.js / @react-three-fiber ambient network graph (client-only, dynamic import) |
| UI kit | shadcn-style primitives in `components/ui` |

## Routes

**Marketing (static, SEO-complete):** `/` landing · `/about` · `/blog` + `/blog/[slug]` · `/contact` · `/privacy` · `/terms` · `/docs` · `/docs/api` · `/plans` · `/login`

**Console (dynamic):** `/dashboard` · `/jobs` · `/applications` · `/resume-studio` · `/recruiters` · `/autofill-review` · `/settings`

**Infra:** `/sitemap.xml` · `/robots.txt` · `/opengraph-image` · `/icon.svg` · `/api/auth/[...nextauth]` · `/api/newsletter`

## Develop

```bash
cp .env.example .env.local    # then add AUTH_SECRET + OAuth creds
npm ci
npm run dev                   # http://localhost:3000
```

OAuth setup: **[../docs/AUTHENTICATION.md](../docs/AUTHENTICATION.md)** — until credentials are set, `/login` shows a setup hint and the console stays open (`AUTH_ENFORCED=false`).

## Build & lint

```bash
npm run lint    # eslint (0 errors expected; `any` warnings are tracked debt)
npm run build   # production build — marketing pages prerender statically
npm start
```

## Where things live

```
app/                  routes (page.tsx) + sitemap/robots/OG image/icon
components/landing/   hero, features, how-it-works, templates, reviews, FAQ, CTA
components/layout/    TopNav (responsive + session), SiteFooter (+ newsletter form)
components/auth/      OAuth buttons + split-screen auth card
components/three/     NodeGraph (R3F), Ambient3D client-only wrapper
lib/site.ts           brand/SEO/contact config — update before deploying
lib/blog.ts           blog posts as structured data
middleware.ts         optional console gating (AUTH_ENFORCED=true)
```

## Performance notes

- three.js is only loaded on pages that use it (`Ambient3D` → `next/dynamic`, `ssr: false`), capped DPR, reduced node count on mobile, honors `prefers-reduced-motion`.
- Marketing pages are statically prerendered; the console pages stay dynamic for live backend data.
- Security headers + immutable asset caching configured in `next.config.ts`.
