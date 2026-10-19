# Deployment

Kitravo runs on Vercel as a Next.js application. The production domain is `kitravo.musayazlik.com`.

## Required configuration

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | A dedicated PostgreSQL connection string for durable auth and RBAC |
| `BETTER_AUTH_SECRET` | A random secret of at least 32 characters |
| `BETTER_AUTH_URL` | The exact HTTPS origin used for authentication |
| `NEXT_PUBLIC_SITE_URL` | The public origin for metadata, canonical links and sitemap entries |
| `NEXT_PUBLIC_GITHUB_URL` | The public source repository URL |
| `AUTH_DEMO_ENABLED` | `true` to allow anonymous read-only demo sessions |

Only `NEXT_PUBLIC_*` values are bundled into the browser. Keep private credentials in Vercel environment variables, never in Git. Use different secrets and databases for production and previews.

## Database setup

Provision Neon PostgreSQL through the Vercel Marketplace, using the free plan when appropriate. The integration injects database connection variables into the linked project. Kitravo uses a small PostgreSQL connection pool and keeps access-control mutations transactional.

Run `pnpm auth:setup` using the target database and auth environment before serving requests. The command is idempotent and initializes both Better Auth and application access tables. Avoid running migrations concurrently. A deployment build must not silently create a local SQLite database on Vercel.

For local development without `DATABASE_URL`, SQLite remains available at `AUTH_DATABASE_PATH` (default `.data/auth.sqlite`). Test runs use an isolated in-memory database.

## First owner

Set `AUTH_BOOTSTRAP_EMAIL`, `AUTH_BOOTSTRAP_PASSWORD` (10–128 characters), and optionally `AUTH_BOOTSTRAP_NAME`, then run `pnpm auth:setup`. Bootstrap runs only when no superadmin exists and refuses to elevate an existing ordinary account. Remove the bootstrap password after success. The public demo has no administrator password.

## Build and release

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm build
```

Connect the GitHub repository in Vercel, select the Next.js framework, use Node.js 24, and deploy the intended commit. Production builds use `pnpm build`. A `v1.0.0` Git tag and GitHub release identify the first stable source release.

## Custom domain

Add `kitravo.musayazlik.com` to the Kitravo project and configure the exact DNS record Vercel reports. DNS is managed at the domain's authoritative provider; creating a project domain does not itself change external DNS. Verify ownership, HTTPS, canonical URLs, the English landing page, demo entry, and session handling after propagation.

## Operational limits

Posts, media, reviews, inquiries, SEO settings, and email screens currently use sample data/local UI state. AI, MCP execution, uploads, outbound email, OAuth, and account recovery need provider integrations. Auth accounts, roles, assignments, sessions, and audit entries are durable. This is a single-workspace starter; tenant isolation requires an explicit schema and policy extension.
