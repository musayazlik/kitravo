<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project conventions

- Screens live in `src/features/<area>/`; `src/app/**/page.tsx` stays thin (metadata + render the feature).
- Navigation has one source: `src/config/nav.ts` (sidebar, breadcrumbs, command menu). Labels there are message keys, not text.
- i18n: every route lives under `app/[lang]/` (en default, tr, de, ar RTL, zh). No hardcoded UI text: add it to `src/i18n/messages/<area>.ts` in all five languages (missing keys are type errors) and read it with `useI18n()` / `getI18n()`. Import `Link`, `useRouter`, `usePathname` from `@/i18n/navigation`, format dates/numbers with `f.*`, and use logical Tailwind classes (`ms-`, `pe-`, `start-`, `text-start`) so Arabic works. See README "Internationalization".
- Colours come from the tokens in `src/app/globals.css` (`ink`, `proof`, `signal`, `paper`, `rust`). No raw hex in components except chart colours, which mirror the tokens in `src/lib/chart-colors.ts`.
- Cache Components is on. Client code that reads `Date.now()`, `Math.random()` or URL data while rendering must sit behind `<Suspense>`; use `TimeAgo` for relative times and `useHydrated()` for browser-only state. See README "Framework notes".
- Motion: in the panel, only the dashboard pipeline band and the sign-in mark animate on their own. The public landing has a finite intro, scroll-linked layers and interactive previews; avoid ambient loops. Keep `MotionConfig reducedMotion="user"` in `providers.tsx` and provide static reduced-motion states.
- Add shadcn components with `pnpm dlx shadcn@latest add <name>`, charts with `@evilcharts/recharts-<chart>`; keep the evilcharts prerender patches described in the README.
