## Deploy Configuration (configured by /setup-deploy)

- Platform: Render (API) + Vercel (Web)
- Production URL: https://sanchay-api.onrender.com
- Deploy workflow: auto-deploy on push to connected branch
- Deploy status command: HTTP health check
- Merge method: squash
- Project type: web app + API (monorepo)
- Post-deploy health check: https://sanchay-api.onrender.com/api/v1/health

### Custom deploy hooks

- Pre-merge: none
- Deploy trigger: automatic on push to main (Render picks up render.yaml)
- Deploy status: poll https://sanchay-api.onrender.com/api/v1/health
- Health check: https://sanchay-api.onrender.com/api/v1/health

### Services

- API: sanchay-api on Render (https://sanchay-api.onrender.com)
- Web: Vercel project prj_wP5K86MQqZVuBEMmN4zAHsBjVCZX (https://sanchay-web.vercel.app)

### Required Render env vars

- DATABASE_URL: set (Supabase)
- DIRECT_URL: set (Supabase)
- NEXTAUTH_SECRET: set
- REDIS_URL: needs Upstash URL
- CORS_ORIGIN: needs production web URL
- SENTRY_DSN: optional
