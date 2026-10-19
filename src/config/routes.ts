export const PANEL_ROOT = "/panel";
export const PANEL_HOME = "/panel/dashboard";
export const PANEL_SIGN_IN = "/panel/sign-in";

/** A complete segment match keeps public pages and similarly named slugs untouched. */
const legacyPanelSections = new Set([
  "dashboard", "posts", "media", "inbox", "reviews", "seo", "mail", "mcp", "settings", "users", "roles",
  "sign-in", "sign-up", "forgot-password", "reset-password", "verify-email",
]);
export function canonicalPanelPath(pathname: string) {
  const section = pathname.split("/")[1];
  return legacyPanelSections.has(section) ? `${PANEL_ROOT}${pathname}` : pathname;
}

/** Accept only workspace routes as post-login destinations; never arbitrary URLs. */
export function safePanelDestination(value: string | undefined) {
  if (!value || !value.startsWith("/panel/") || /\\|%2f|%5c|[\r\n]/i.test(value)) return PANEL_HOME;
  const pathname = value.split(/[?#]/)[0];
  if (new URL(value, "https://local.invalid").pathname !== pathname) return PANEL_HOME;
  const section = pathname.split("/")[2];
  if (["sign-in", "sign-up", "forgot-password", "reset-password", "verify-email"].includes(section)) return PANEL_HOME;
  return value;
}
