/** Stable permission IDs are the contract between the UI, routes and data services. */
export const permissionGroups = {
  dashboard: ["read"],
  posts: ["read", "create", "update", "delete", "publish"],
  taxonomy: ["manage"],
  comments: ["read", "moderate"],
  media: ["read", "upload", "delete"],
  inbox: ["read", "manage"],
  reviews: ["read", "manage"],
  seo: ["read", "manage"],
  mail: ["read", "manage"],
  mcp: ["read", "manage"],
  settings: ["read", "manage"],
  users: ["read", "manage"],
  roles: ["read", "manage"],
  audit: ["read"],
  system: ["manage"],
} as const;

export type Permission = { [K in keyof typeof permissionGroups]: `${K}.${(typeof permissionGroups)[K][number]}` }[keyof typeof permissionGroups];
export const permissions = Object.entries(permissionGroups).flatMap(([resource, actions]) => actions.map((action) => `${resource}.${action}` as Permission));
export const isPermission = (value: string): value is Permission => permissions.includes(value as Permission);

export type Role = { id: string; name: string; description: string; system: boolean; permissions: Permission[] };
export type Principal = { id: string; name: string; email: string; avatar: string; demo: boolean; roles: Role[]; permissions: Permission[] };
export type AccessUser = { id: string; name: string; email: string; roles: string[]; demo: boolean };
export type AuditEntry = { id: string; actor: string; action: string; target: string; createdAt: string };
export type AccessSnapshot = { principal: Principal; roles: Role[]; users: AccessUser[]; audit: AuditEntry[] };

const readOnly = permissions.filter((permission) => permission.endsWith(".read") && !["audit.read", "users.read", "roles.read"].includes(permission));
export const systemRoles: Role[] = [
  { id: "demo", name: "Demo", description: "Read-only product tour. Cannot make changes or access private user data.", system: true, permissions: readOnly },
  { id: "user", name: "User", description: "Personal workspace access. The default role for new accounts.", system: true, permissions: ["dashboard.read"] },
  { id: "admin", name: "Admin", description: "Manage content, users and custom roles without granting system ownership.", system: true, permissions: permissions.filter((permission) => permission !== "system.manage") },
  { id: "superadmin", name: "Superadmin", description: "System owner with all permissions and control over protected accounts.", system: true, permissions: [...permissions] },
];

/** Missing permissions always deny access; demo stays read-only even if misassigned. */
export function can(principal: Pick<Principal, "permissions" | "demo"> | null, permission: Permission) {
  if (!principal || (principal.demo && !readOnly.includes(permission))) return false;
  return principal.permissions.includes(permission);
}

/** Sample-only screens; this grants no permission to query or mutate real records. */
export function canPreviewPage(principal: Pick<Principal, "demo"> | null, permission: Permission) {
  return principal?.demo === true && (permission === "users.read" || permission === "roles.read");
}

/** More specific paths must come first. Unknown panel paths are never implicitly allowed. */
export const routePermissions: Record<string, Permission> = {
  "/panel/posts/new": "posts.create", "/panel/posts/categories": "posts.read", "/panel/posts/tags": "posts.read",
  "/panel/posts/comments": "comments.read", "/panel/posts": "posts.read", "/panel/dashboard": "dashboard.read",
  "/panel/media": "media.read", "/panel/inbox": "inbox.read", "/panel/reviews": "reviews.read", "/panel/seo": "seo.read",
  "/panel/mail": "mail.read", "/panel/mcp": "mcp.read", "/panel/settings": "settings.read", "/panel/users": "users.read", "/panel/roles": "roles.read",
};
export function permissionForPath(path: string): Permission | undefined {
  return Object.entries(routePermissions).find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`))?.[1];
}
