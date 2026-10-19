# Routing and layout

The public site and blog live under `/[lang]`. Workspace and authentication screens live under `/[lang]/panel`. Supported language prefixes are `en` (default), `tr`, `de`, `ar`, and `zh`.

```text
src/app/[lang]/
  (site)/                         /en, /en/blog, /en/blog/[slug]
  panel/
    page.tsx                      /en/panel → /en/panel/dashboard
    (auth)/                       sign-in, sign-up, forgot-password, reset-password, verify-email
    (workspace)/                  Shared panel shell and permission checks
      dashboard/                  /en/panel/dashboard
      posts/                      posts, new, [id], categories, tags, comments
      media/ inbox/ reviews/
      seo/ mail/ mcp/
      users/ roles/ settings/
```

Route groups `(site)`, `(auth)`, and `(workspace)` do not appear in URLs. Authentication screens use their own layout so the workspace's access guard cannot redirect sign-in back to itself. API endpoints remain at `/api/auth/*` and `/api/access/*`.

## Redirects

`src/config/routes.ts` defines canonical panel paths, legacy mappings, and safe sign-in return destinations. `src/proxy.ts` preserves language, record IDs, and query parameters while redirecting legacy URLs:

- `/en/posts/p2?tab=seo` → `/en/panel/posts/p2?tab=seo` (308)
- `/de/settings/languages` → `/de/panel/settings/languages` (308)
- `/sign-in` → `/en/panel/sign-in`, unless a language was explicitly selected
- `/en/blog/article` stays unchanged.

Path matching uses complete segments, so unrelated paths such as `/posts-old` are preserved. Sign-in destinations cannot escape the workspace, traverse directories, or loop into an authentication route.

English is used for new visitors. An explicit `NEXT_LOCALE` cookie or a language-prefixed URL overrides that default. `Accept-Language` alone does not change the initial language.

Navigation, command-menu entries, and breadcrumbs share `src/config/nav.ts`. Breadcrumbs omit the structural `panel` segment. Permission matching uses canonical `/panel/*` paths. Robots excludes every locale's panel tree.

## Shared widths

`src/components/layout/container.tsx` defines:

| Size | Maximum width | Usage |
| --- | --- | --- |
| `site` | 1200 px | Landing, site navigation, footer |
| `panel` | 1280 px | Workspace content and header |
| `reading` | 800 px | Reading-oriented content |

Containers use `w-full`, `min-w-0`, and `mx-auto`. The panel's `Main` component applies the shared container; screens should not redefine its width. Responsive padding increases from `p-4` to `md:p-6` and `lg:p-8`.

## Landing behavior

`src/features/landing/studio-landing.tsx` and `studio.css` implement writing, media, publishing, and role previews. Motion consists of a finite intro, scroll-linked layers, pointer tilt, and interactive transitions. Reduced motion has a static CSS fallback and hydration-safe client state. Preview windows follow the active theme; cover artwork keeps consistent printed colors.

`DemoEntry` creates a real anonymous Better Auth session before entering the read-only workspace. Preview controls on the public landing do not mutate content.

`pnpm test:routes` covers legacy redirects, English defaults, explicit locale choices, canonical paths, and safe sign-in destinations.
