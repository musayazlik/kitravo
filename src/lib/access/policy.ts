import { can, type Permission, type Principal, type Role } from "./catalog";

export class AccessError extends Error {
  constructor(message: string, public status = 403) { super(message); }
}
export function assertPermission(principal: Principal | null, permission: Permission): asserts principal is Principal {
  if (!principal) throw new AccessError("You must sign in.", 401);
  if (!can(principal, permission)) throw new AccessError("You do not have permission to perform this action.");
}
export function assertGrantable(actor: Principal, role: Pick<Role, "id" | "permissions">) {
  if (role.id === "superadmin" && !can(actor, "system.manage")) throw new AccessError("Only the system owner can assign the superadmin role.");
  if (role.permissions.some((permission) => !can(actor, permission))) throw new AccessError("You cannot grant permissions you do not have.");
}
export function assertEditableRole(actor: Principal, role: Role) {
  assertPermission(actor, "roles.manage");
  if (role.system) throw new AccessError("System roles cannot be changed or deleted.");
  assertGrantable(actor, role);
}
export function assertAssignable(actor: Principal, target: { id: string; demo: boolean; roles: string[] }, roles: Role[]) {
  assertPermission(actor, "users.manage");
  if (actor.id === target.id) throw new AccessError("You cannot change your own roles.");
  if (target.demo || roles.some((role) => role.id === "demo")) throw new AccessError("Demo account roles cannot be changed.");
  if (target.roles.includes("superadmin") && !can(actor, "system.manage")) throw new AccessError("Only the system owner can manage this account.");
  if (!roles.length) throw new AccessError("Select at least one role.", 400);
  roles.forEach((role) => assertGrantable(actor, role));
}
