# Fullstack Product Template

A production-ready Turborepo monorepo template.

## Stack

| Layer      | Tech                                                         |
| ---------- | ------------------------------------------------------------ |
| Frontend   | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend    | Express, TypeScript, Clerk auth, BullMQ                      |
| Database   | Prisma + PostgreSQL (Supabase)                               |
| Auth       | Clerk                                                        |
| State      | React Query (server) + Zustand (client)                      |
| Forms      | React Hook Form + Zod                                        |
| Jobs       | BullMQ + Redis (Upstash)                                     |
| Monitoring | Sentry + PostHog                                             |
| CI/CD      | GitHub Actions → Vercel (web) + Railway (api)                |

<img width="769" height="1051" alt="Screenshot 2026-03-23 at 12 16 12 AM" src="https://github.com/user-attachments/assets/519e0693-932a-4590-8132-2721473e0f78" />

## Structure

```
sanchay/
├── apps/
│   ├── web/          # Next.js 15 frontend → Vercel
│   └── api/          # Express backend → Railway (Docker)
└── packages/
    ├── db/           # Prisma schema + client
    ├── types/        # Shared TypeScript types
    ├── validators/   # Shared Zod schemas
    └── config/       # Shared tsconfig, ESLint, Prettier
```

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9

### Install

```bash
pnpm install
```

### Environment variables

Copy and fill in `.env.example` files:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
cp packages/db/.env.example packages/db/.env
```

### Database setup

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations (dev)
pnpm --filter @sanchay/db db:migrate:dev

# Seed (optional)
pnpm --filter @sanchay/db db:seed
```

### shadcn/ui setup

After installing, initialize shadcn in the web app:

```bash
cd apps/web
npx shadcn@latest init
```

### Development

```bash
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:3001

## Commands

| Command                               | Description                |
| ------------------------------------- | -------------------------- |
| `pnpm dev`                            | Start all apps in dev mode |
| `pnpm build`                          | Build all apps             |
| `pnpm lint`                           | Lint all packages          |
| `pnpm type-check`                     | Type-check all packages    |
| `pnpm test`                           | Run all unit tests         |
| `pnpm --filter @sanchay/web test:e2e` | Run Playwright E2E tests   |
| `pnpm --filter @sanchay/db db:studio` | Open Prisma Studio         |

## Key conventions

- **Never duplicate types** — all types live in `packages/types`, all Zod schemas in `packages/validators`
- **Never write raw SQL** — always use Prisma client from `@sanchay/db`
- **Every API route validates input** with Zod before any business logic
- **All env vars are validated at startup** with Zod in each app

## Deployment

### Web → Vercel

Link your repo to a Vercel project and set env vars from `apps/web/.env.example`.

### API → Railway

The `apps/api/Dockerfile` is used. Set env vars from `apps/api/.env.example` in Railway dashboard.

### Required GitHub secrets

```
VERCEL_TOKEN
RAILWAY_TOKEN
DATABASE_URL
DIRECT_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```
