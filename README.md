# Kitravo

An open-source Next.js starter for content platforms, with a public landing page, multilingual blog, Tiptap editor, media workflows, and a permission-aware workspace.

**[Live demo](https://kitravo.musayazlik.com)** · **[GitHub](https://github.com/musayazlik/kitravo)** · **Version 1.0.0**

## Features

- A responsive landing page with interactive product previews and accessible light/dark themes.
- English by default, with optional Turkish, German, Arabic (RTL), and Simplified Chinese interfaces.
- A public blog and Tiptap editor with language-specific content and slugs.
- Real Better Auth sessions, anonymous read-only demos, custom roles, multiple role assignments, and an audit trail.
- PostgreSQL for serverless production deployments; SQLite for simple local development.
- Workspace screens for posts, media, comments, inquiries, reviews, users, SEO, email, settings, and MCP/AI tools.

Authentication and RBAC are connected to durable storage. Content screens use typed sample data and local state. AI generation, uploads, outbound email, password recovery, email verification, and OAuth require your integrations; they are not represented as live services in the demo.

## Quick start

Use Node.js 22.13 or newer (Node.js 24 LTS is recommended) and the pnpm version declared in `package.json`.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [localhost:3000](http://localhost:3000). New visitors start in English at `/en`; selecting another language is remembered. The workspace is at `/en/panel/dashboard` and sign-in at `/en/panel/sign-in`.

`pnpm dev` runs the idempotent auth setup before starting Next.js. With no `DATABASE_URL`, development uses `.data/auth.sqlite` and generates a local auth secret. Neither file is committed.

To create the first owner, set `AUTH_BOOTSTRAP_EMAIL` and `AUTH_BOOTSTRAP_PASSWORD` in `.env.local`, then run `pnpm auth:setup`. Remove the bootstrap password afterward. There are no default administrator credentials.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Initialize local auth/RBAC and start development |
| `pnpm auth:setup` | Apply auth/RBAC migrations and optionally bootstrap the first owner |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Check TypeScript |
| `pnpm test` | Run access-control and routing tests |
| `pnpm test:postgres` | Run the access suite in an isolated temporary PostgreSQL schema |
| `pnpm check` | Run lint, type checking, and tests |

## Deploy to Vercel

1. Import this repository as a **Next.js** project using Node.js 24.
2. Connect a dedicated Neon PostgreSQL database through the Vercel Marketplace. Keep production and preview data separate.
3. Set `BETTER_AUTH_SECRET` to a random secret of at least 32 characters. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to your deployment's HTTPS origin. Set `NEXT_PUBLIC_GITHUB_URL` to your public repository URL.
4. Run `pnpm auth:setup` against the production database before serving traffic. Use a direct connection for administrative migrations if your provider requires it.
5. Deploy, attach your domain, and apply the exact DNS record reported by Vercel at your authoritative DNS provider.

For this release the production origin is `https://kitravo.musayazlik.com`. Local SQLite is not suitable for Vercel's ephemeral filesystem. Do not upload local databases, administrator files, secrets, or debug captures.

See [Deployment](docs/deployment.md), [Authentication and access control](docs/rbac.md), and [Routing and layout](docs/layout-and-routing.md).

## Project structure

```text
src/
  app/[lang]/
    (site)/             Public landing and blog
    panel/(auth)/       Sign-in, sign-up and account flows
    panel/(workspace)/  Protected workspace screens
  app/api/              Authentication and access-control endpoints
  components/           Shared UI, layout, charts and access gates
  config/               Brand, site metadata, navigation and route definitions
  features/<area>/      Screens, components and typed sample data
  hooks/                Shared React hooks
  i18n/                 Dictionaries, formatting and locale-aware navigation
  lib/access/           Database, permissions, policies, repository and sessions
scripts/                Auth schema setup and owner bootstrap
tests/                  Routing and access-control regression tests
```

Keep route files thin: metadata and rendering belong in `app`, screen implementations in `features`. `src/config/nav.ts` is the source of truth for sidebar navigation, breadcrumbs, and the command menu.

## Internationalization

English is the default source language. `src/i18n/messages/<area>.ts` defines the same keys in all five supported languages; missing keys are TypeScript errors.

- Read client strings with `useI18n()` and server strings with `getI18n()`.
- Import `Link`, `useRouter`, and `usePathname` from `@/i18n/navigation`.
- Format dates and numbers with `f.*`. Use logical Tailwind classes such as `ms-`, `pe-`, `start-`, and `text-start` for RTL support.
- Posts and email templates support language-specific content. Arabic and Chinese post translations use Latin source slugs.
- An explicit language cookie or URL is honored; browser language alone does not change the English default.

## Design and branding

`src/config/brand.ts` defines the Kitravo name and canonical `public/logo.png` artwork. The shared `LogoMark` component is used across navigation, authentication, and previews. App icons are derived from the same artwork; see the [brand notes](public/images/brand/README.md).

The **Ink & Proof** design system uses paper surfaces, a blue `ink` brand color, amber `proof`, green `signal`, and destructive `rust`. Define colors in `src/app/globals.css`; chart literals mirror them in `src/lib/chart-colors.ts`.

Typography uses Bricolage Grotesque, Instrument Sans, JetBrains Mono, and Noto Sans Arabic. UI primitives are shadcn/ui and Radix; charts use Recharts/EvilCharts, forms use React Hook Form and Zod, and tables use TanStack Table.

## Framework notes

This project uses Next.js 16.4 with Cache Components and Partial Prefetching. Read the installed guides in `node_modules/next/dist/docs/` before changing framework APIs.

- Put client render-time URL, clock, or random values behind Suspense. Use `TimeAgo` and `useHydrated()` for browser-only state.
- Keep `MotionConfig reducedMotion="user"` and static reduced-motion styles. Landing motion is finite, scroll-linked, or interactive; avoid ambient loops.
- Preserve the EvilCharts prerender fixes: generate skeleton data only while loading and avoid reading the clock during server rendering.
- Add UI primitives with `pnpm dlx shadcn@latest add <name>` and chart components from `@evilcharts/recharts-<chart>`.

## Contributing

See [Contributing](CONTRIBUTING.md) and [Security](SECURITY.md). Changes should include appropriate checks and keep all supported locales and RTL layouts working.

## License

MIT. See [LICENSE](LICENSE).
