import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { rolesForUser } from "./repository";
import { systemRoles, type Principal } from "./catalog";
import { assertPermission } from "./policy";
import { PANEL_SIGN_IN, safePanelDestination } from "@/config/routes";
import { localizeHref, type Locale } from "@/i18n/config";
import type { Permission } from "./catalog";

export const getPrincipal = cache(async (): Promise<Principal | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const demo = Boolean((session.user as typeof session.user & { isAnonymous?: boolean }).isAnonymous);
  const roles = demo ? systemRoles.filter((role) => role.id === "demo") : await rolesForUser(session.user.id);
  return {
    id: session.user.id, name: demo ? "Demo" : session.user.name, email: demo ? "" : session.user.email,
    avatar: session.user.image ?? "", demo, roles, permissions: [...new Set(roles.flatMap((role) => role.permissions))],
  };
});

/** Call at every data or mutation boundary. UI gates are only a convenience. */
export async function requirePermission(permission: Permission) {
  const principal = await getPrincipal();
  assertPermission(principal, permission);
  return principal;
}

export async function getSignInHref(locale: Locale) {
  const destination = safePanelDestination((await headers()).get("x-kitravo-return-to") ?? undefined);
  return `${localizeHref(PANEL_SIGN_IN, locale)}?next=${encodeURIComponent(destination)}`;
}
