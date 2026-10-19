import { randomUUID } from "node:crypto";
import { executeSchema, query, transaction } from "./database";
import { systemRoles, type AccessUser, type AuditEntry, type Permission, type Principal, type Role } from "./catalog";
import { AccessError, assertAssignable, assertEditableRole, assertGrantable, assertPermission } from "./policy";

export { transaction } from "./database";

export async function migrateAccess() {
  await executeSchema(`
    CREATE TABLE IF NOT EXISTS access_role (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, system INTEGER NOT NULL DEFAULT 0);
    CREATE UNIQUE INDEX IF NOT EXISTS access_role_name ON access_role (lower(name));
    CREATE TABLE IF NOT EXISTS access_permission ("roleId" TEXT NOT NULL REFERENCES access_role(id) ON DELETE CASCADE, permission TEXT NOT NULL, PRIMARY KEY("roleId", permission));
    CREATE TABLE IF NOT EXISTS access_user_role ("userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE, "roleId" TEXT NOT NULL REFERENCES access_role(id), PRIMARY KEY("userId", "roleId"));
    CREATE TABLE IF NOT EXISTS access_audit (id TEXT PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL, "createdAt" TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS access_user_role_role ON access_user_role("roleId");
  `);
  await transaction(async () => {
    for (const role of systemRoles) {
      await query("INSERT INTO access_role (id,name,description,system) VALUES (?,?,?,1) ON CONFLICT DO NOTHING", [role.id, role.name, role.description]);
      await query("UPDATE access_role SET description=? WHERE id=?", [role.description, role.id]);
      // Built-in policies are versioned in code, never editable through the API.
      await query('DELETE FROM access_permission WHERE "roleId" = ?', [role.id]);
      for (const permission of role.permissions) await query('INSERT INTO access_permission ("roleId",permission) VALUES (?,?)', [role.id, permission]);
    }
  });
}

export async function listRoles(): Promise<Role[]> {
  const [roles, permissions] = await Promise.all([
    query("SELECT * FROM access_role ORDER BY system DESC, name"),
    query('SELECT "roleId",permission FROM access_permission ORDER BY permission'),
  ]);
  return roles.map((row) => ({
    id: String(row.id), name: String(row.name), description: String(row.description), system: Boolean(row.system),
    permissions: permissions.filter((entry) => entry.roleId === row.id).map((entry) => String(entry.permission) as Permission),
  }));
}
export async function rolesForUser(id: string) {
  const ids = (await query('SELECT "roleId" FROM access_user_role WHERE "userId" = ?', [id])).map((row) => row.roleId);
  return (await listRoles()).filter((role) => ids.includes(role.id));
}
export async function addInitialRole(id: string, demo: boolean) {
  await query('INSERT INTO access_user_role ("userId","roleId") VALUES (?,?) ON CONFLICT DO NOTHING', [id, demo ? "demo" : "user"]);
}
export async function listUsers(): Promise<AccessUser[]> {
  const [users, roles] = await Promise.all([query('SELECT id,name,email,"isAnonymous" FROM "user" ORDER BY name'), query('SELECT "userId","roleId" FROM access_user_role')]);
  return users.map((row) => ({
    id: String(row.id), name: String(row.name), email: Boolean(row.isAnonymous) ? "" : String(row.email), demo: Boolean(row.isAnonymous),
    roles: roles.filter((role) => role.userId === row.id).map((role) => String(role.roleId)),
  }));
}
async function audit(actor: Principal, action: string, target: string) {
  await query('INSERT INTO access_audit (id,actor,action,target,"createdAt") VALUES (?,?,?,?,?)', [randomUUID(), actor.id, action, target, new Date().toISOString()]);
}
export async function listAudit(): Promise<AuditEntry[]> {
  return (await query('SELECT * FROM access_audit ORDER BY "createdAt" DESC LIMIT 50')).map((row) => ({
    id: String(row.id), actor: String(row.actor), action: String(row.action), target: String(row.target), createdAt: String(row.createdAt),
  }));
}
async function freshActor(actor: Principal): Promise<Principal> {
  const [user] = await query('SELECT "isAnonymous" FROM "user" WHERE id=?', [actor.id]);
  if (!user) throw new AccessError("This account no longer exists.", 401);
  const roles = await rolesForUser(actor.id);
  return { ...actor, demo: Boolean(user.isAnonymous), roles, permissions: [...new Set(roles.flatMap((role) => role.permissions))] };
}
export async function saveRole(actor: Principal, input: { id?: string; name: string; description: string; permissions: Permission[] }) {
  return transaction(async () => {
    actor = await freshActor(actor);
    assertPermission(actor, "roles.manage");
    const allRoles = await listRoles();
    const existing = input.id ? allRoles.find((role) => role.id === input.id) : undefined;
    if (input.id && !existing) throw new AccessError("Role not found.", 404);
    if (existing) assertEditableRole(actor, existing);
    const id = existing?.id ?? randomUUID();
    if (input.permissions.includes("system.manage")) throw new AccessError("System management is reserved for the built-in superadmin role.");
    assertGrantable(actor, { id, permissions: input.permissions });
    if (input.permissions.includes("taxonomy.manage") && !input.permissions.includes("posts.read")) throw new AccessError("taxonomy.manage requires posts.read.", 400);
    for (const permission of input.permissions) {
      const read = `${permission.split(".")[0]}.read` as Permission;
      if (permission !== "taxonomy.manage" && !permission.endsWith(".read") && !input.permissions.includes(read)) throw new AccessError(`${permission} requires ${read}.`, 400);
    }
    if (allRoles.some((role) => role.id !== id && role.name.toLowerCase() === input.name.toLowerCase())) throw new AccessError("A role with this name already exists.", 409);
    if (existing) await query("UPDATE access_role SET name=?, description=? WHERE id=?", [input.name, input.description, id]);
    else await query("INSERT INTO access_role (id,name,description,system) VALUES (?,?,?,0)", [id, input.name, input.description]);
    await query('DELETE FROM access_permission WHERE "roleId"=?', [id]);
    for (const permission of new Set(input.permissions)) await query('INSERT INTO access_permission ("roleId",permission) VALUES (?,?)', [id, permission]);
    await audit(actor, existing ? "role.updated" : "role.created", id);
    return id;
  });
}
export async function deleteRole(actor: Principal, id: string) {
  await transaction(async () => {
    actor = await freshActor(actor);
    const role = (await listRoles()).find((entry) => entry.id === id);
    if (!role) throw new AccessError("Role not found.", 404);
    assertEditableRole(actor, role);
    if ((await query('SELECT 1 FROM access_user_role WHERE "roleId"=? LIMIT 1', [id])).length) throw new AccessError("This role is assigned. Move its users to another role first.", 409);
    await query("DELETE FROM access_role WHERE id=?", [id]);
    await audit(actor, "role.deleted", id);
  });
}
export async function assignRoles(actor: Principal, userId: string, ids: string[]) {
  await transaction(async () => {
    actor = await freshActor(actor);
    const target = (await listUsers()).find((user) => user.id === userId);
    if (!target) throw new AccessError("User not found.", 404);
    const roles = (await listRoles()).filter((role) => ids.includes(role.id));
    if (roles.length !== new Set(ids).size) throw new AccessError("Invalid role.", 400);
    assertAssignable(actor, target, roles);
    (await rolesForUser(userId)).forEach((role) => assertGrantable(actor, role));
    if (target.roles.includes("superadmin") && !ids.includes("superadmin")) {
      const [count] = await query('SELECT COUNT(*) AS count FROM access_user_role WHERE "roleId"=\'superadmin\'');
      if (Number(count?.count) <= 1) throw new AccessError("The last superadmin cannot be demoted.");
    }
    await query('DELETE FROM access_user_role WHERE "userId"=?', [userId]);
    for (const id of new Set(ids)) await query('INSERT INTO access_user_role ("userId","roleId") VALUES (?,?)', [userId, id]);
    await audit(actor, "user.roles.updated", `${userId}:${ids.join(",")}`);
  });
}
