# Deployment — production with SSL

Target: a single Linux VM (2 vCPU / 4 GB is plenty) running the full stack with real TLS from Let's Encrypt. Two paths below — **Caddy (easiest, automatic certs)** or **Nginx + certbot**.

> **SSL is not optional.** OAuth providers require secure redirect URIs, auth cookies flip to `Secure` only under HTTPS, and a tool that touches your career data should never cross plain HTTP.

---

## 0. Prerequisites

- A domain (e.g. `jobs.example.com`) with an A record → your server IP
- Docker + Docker Compose on the server
- Firewall: allow `22`, `80`, `443`

## 1. Configure the stack

```bash
git clone <your-repo> job-agent && cd job-agent
cp .env.example .env
nano .env
```

Set at minimum:

```env
ENVIRONMENT=production
DRY_RUN=true                      # keep until you've validated the flow
DATABASE_URL=postgresql+asyncpg://job_agent:STRONG_PASSWORD@db:5432/job_agent
CORS_ORIGINS=https://jobs.example.com
FRONTEND_URL=https://jobs.example.com
SENTRY_DSN=...                    # optional but recommended
```

And for the frontend (`frontend/.env.local`, or export at build):

```env
AUTH_SECRET=<openssl rand -base64 32>
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
AUTH_ENFORCED=true  # default — keep auth required in production
NEXT_PUBLIC_SITE_URL=https://jobs.example.com
NEXT_PUBLIC_API_URL=https://jobs.example.com/api/v1
```

Update both OAuth apps' redirect URIs to the production callbacks (see [AUTHENTICATION.md](AUTHENTICATION.md) §7).

## 2. Run the backend stack

```bash
docker compose up -d --build
# db → migrations run automatically → backend :8000 → worker
curl -k https://localhost:8000/health
```

Build & serve the frontend (either `npm ci && npm run build && npm start` on the host, or add a third container with a simple `Dockerfile.frontend` — a Node 20 alpine image running `npm start` on :3000).

## 3a. TLS with Caddy (recommended)

```bash
# debian/ubuntu
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudflare.com/cloudflare-main.gpg' | sudo gpg --dearmor -o /usr/share/keyrings/caddy.gpg 2>/dev/null || true
# or use the official caddy repo: https://caddyserver.com/docs/install
```

`/etc/caddy/Caddyfile`:

```caddy
jobs.example.com {
    # frontend
    reverse_proxy localhost:3000

    # API + docs under the same origin (keeps CORS trivial)
    handle /api/v1/* {
        reverse_proxy localhost:8000
    }
    handle /health {
        reverse_proxy localhost:8000
    }
    handle /openapi.json {
        reverse_proxy localhost:8000
    }
    handle /docs* {
        reverse_proxy localhost:8000
    }
}
```

```bash
sudo systemctl reload caddy
```

Caddy obtains **and auto-renews** the Let's Encrypt certificate on first request — no certbot, no cron. HTTP is redirected to HTTPS automatically, and HSTS on the backend is enabled automatically in production (`ENVIRONMENT=production`).

## 3b. TLS with Nginx + certbot

```nginx
server {
    listen 80;
    server_name jobs.example.com;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl http2;
    server_name jobs.example.com;

    ssl_certificate     /etc/letsencrypt/live/jobs.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jobs.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location ~ ^/(api/v1|health|openapi.json|docs) {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo certbot --nginx -d jobs.example.com   # obtains + installs cert, adds renew timer
sudo certbot renew --dry-run               # verify auto-renewal
```

## 4. Post-deploy checklist

- [ ] `https://jobs.example.com/health` returns `{"status":"ok", ...}`
- [ ] Sign-in works end-to-end (both providers)
- [ ] Security headers present: `curl -sI https://jobs.example.com | grep -iE 'x-frame|x-content|strict-transport'`
- [ ] Sitemap live: `https://jobs.example.com/sitemap.xml`, robots: `/robots.txt`
- [ ] Run one full cycle in DRY_RUN, review the approval queue, then decide about LIVE mode
- [ ] DB backups: `docker exec db pg_dump -U job_agent job_agent | gzip > backup-$(date +%F).sql.gz` (cron it)
- [ ] `docker compose pull && docker compose up -d` in a maintenance window for updates

## 5. Zero-downtime notes

- Migrations run on backend start (`alembic upgrade head`) — keep them backward-compatible for rolling deploys.
- The Next.js app is stateless; run multiple instances behind the proxy whenever you need it.
- Changing `AUTH_SECRET` logs everyone out — plan it.

## Alternative: managed platforms

Vercel (frontend) + Fly.io/Railway (backend + Postgres) works well: both terminate TLS for you, and you only set the env vars. Point `NEXT_PUBLIC_API_URL` at the backend's public URL and add that origin to `CORS_ORIGINS`.
