# Authentication and access control

Kitravo uses Better Auth for sessions and email/password accounts, plus permission-based role policies. PostgreSQL is the durable backend on Vercel; SQLite is available for local development.

## Setup

Copy `.env.example` to `.env.local`. `BETTER_AUTH_URL` must match the running app's origin. `pnpm dev` runs the idempotent `pnpm auth:setup` command before starting Next.js. Run the setup command explicitly for a new production database. Production requires a random `BETTER_AUTH_SECRET` of at least 32 characters.

For the first owner, configure `AUTH_BOOTSTRAP_EMAIL`, `AUTH_BOOTSTRAP_PASSWORD` (10–128 characters), and optionally `AUTH_BOOTSTRAP_NAME`. Setup refuses to promote an existing ordinary account and does nothing when a superadmin already exists. Remove the bootstrap password after success. Never commit owner credentials or `.data` files.

Sign-in is at `/en/panel/sign-in`, users at `/en/panel/users`, and roles at `/en/panel/roles`. Other supported locale prefixes work too. New accounts receive only the `user` role; client-supplied role fields are ignored. The demo button creates a real anonymous session. `AUTH_DEMO_ENABLED=false` disables that endpoint.

## Data model

Better Auth manages users, sessions, accounts, verification records, and rate limits. Application tables are:

| Table | Responsibility |
| --- | --- |
| `access_role` | Unique role names, descriptions, and built-in policy markers |
| `access_permission` | Role-to-permission mapping |
| `access_user_role` | User-to-role assignments; multiple roles are supported |
| `access_audit` | Actor, action, target, and timestamp |

| Built-in role | Policy |
| --- | --- |
| `demo` | Read-only product screens and sample-only users/roles previews; no private accounts, custom roles, or audit data |
| `user` | Personal dashboard access (`dashboard.read`) |
| `admin` | Content, users, and custom-role management without `system.manage` |
| `superadmin` | All permissions, including protected owner accounts |

Permission IDs are typed in `src/lib/access/catalog.ts`. A user's permissions are the union of their assigned roles. Unknown or missing permissions deny access. Demo writes remain forbidden even if an incorrect permission is assigned.

Built-in roles cannot be edited or deleted through the API. Custom roles cannot acquire `system.manage`. Administrators cannot grant permissions they do not have, edit stronger roles, or change a superadmin. Self-demotion and removal of the last owner are blocked. Assigned custom roles must be unassigned before deletion. Write/manage permissions require the corresponding read permission; `taxonomy.manage` requires `posts.read`.

## Server boundaries

- `getPrincipal()` validates the Better Auth session and loads current role grants from the database. Permission claims from cookies or local storage are not trusted; session cookie caching is disabled.
- Every workspace screen uses `protectPage()` before rendering protected data. Request-bound checks remain behind Suspense for Cache Components.
- Sidebar and command-menu visibility use the same principal. `Can` and `ActionButton` are UI conveniences, not security boundaries.
- Demo users/roles pages render only fictional `example.test` fixtures from `features/access/data/demo-access.ts`. They never query private accounts, custom roles, or audit records.
- Call `requirePermission()` before a real data query or mutation. A layout or hidden button alone is insufficient.
- Access-control API writes validate session, permissions, and request origin. Repository mutations reload grants inside a transaction; role changes and their audit entries commit or roll back together.
- PostgreSQL transactions serialize policy mutations with a transaction-scoped advisory lock. SQLite transactions use a local queue to prevent interleaving asynchronous work.

```ts
import { requirePermission } from "@/lib/access/session";

export async function publishPost(id: string) {
  const actor = await requirePermission("posts.publish");
  // Validate workspace and record ownership before updating real content.
  // await repository.publish({ id, actorId: actor.id });
}
```

## Storage and scope

Set `DATABASE_URL` to use PostgreSQL. Use a pooled URL for application requests and a direct URL for administrative migrations when required by the provider. Vercel deployments fail clearly if shared storage is missing; they do not fall back to ephemeral SQLite files.

Without `DATABASE_URL`, local development uses `AUTH_DATABASE_PATH` or `.data/auth.sqlite`. The local database and development secret are ignored by Git. Access tests use `:memory:` so they do not change development or production accounts.

This release supports one workspace. Multi-tenant deployments need explicit `workspaceId` scoping, ownership policies, and composite constraints. `posts.update` currently describes workspace-wide editing; editing only one's own content requires an additional policy.

## Current integration limits

Auth accounts, sessions, role assignments, and audit data are persistent. Content screens still use sample data/local state. Password recovery, verification email, and OAuth need provider configuration; the interface does not present them as connected services. Real content APIs must enforce the same server-side policy boundaries.

Run `pnpm test:access` to verify real Better Auth sessions, demo isolation, role escalation prevention, revocation, and transactional audit behavior.
