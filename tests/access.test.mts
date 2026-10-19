import test, { after } from "node:test";
import assert from "node:assert/strict";

if (process.env.KITRAVO_TEST_POSTGRES !== "true") process.env.AUTH_DATABASE_PATH = ":memory:";
process.env.BETTER_AUTH_SECRET = "isolated-test-secret-with-at-least-thirty-two-characters";
const { auth } = await import("../src/lib/auth");
const { getMigrations } = await import("better-auth/db/migration");
const { query, closeDatabase } = await import("../src/lib/access/database");
const { migrateAccess, listRoles, rolesForUser, saveRole, deleteRole, assignRoles, listAudit } = await import("../src/lib/access/repository");
const { can, canPreviewPage, systemRoles, permissionForPath } = await import("../src/lib/access/catalog");
const { accessibleNavGroups } = await import("../src/config/nav");
const { demoAccessData } = await import("../src/features/access/data/demo-access");
const { default: accessMessages } = await import("../src/i18n/messages/access");
const { assertGrantable, AccessError } = await import("../src/lib/access/policy");
import type { Principal } from "../src/lib/access/catalog";

await (await getMigrations(auth.options)).runMigrations();
await migrateAccess();
after(closeDatabase);
const password = "Isolated-test-password-123!";
async function account(email: string, role = "user") {
  const { user } = await auth.api.signUpEmail({ body: { email, password, name: email.split("@")[0] } });
  await query('DELETE FROM access_user_role WHERE "userId"=?', [user.id]);
  await query('INSERT INTO access_user_role ("userId","roleId") VALUES (?,?)', [user.id, role]);
  return principal(user.id, user.name, user.email);
}
async function principal(id: string, name = "Test", email = "test@example.com"): Promise<Principal> {
  const roles = await rolesForUser(id);
  return { id, name, email, avatar: "", demo: false, roles, permissions: [...new Set(roles.flatMap((role) => role.permissions))] };
}
const owner = await account("owner@example.com", "superadmin");
const admin = await account("admin@example.com", "admin");
const user = await account("user@example.com");
const fail = (work: () => unknown, status = 403) => assert.rejects(async () => work(), (error) => error instanceof AccessError && error.status === status);

test("signup cannot inject an administrative role", async () => {
  const response = await auth.handler(new Request("http://localhost:3000/api/auth/sign-up/email", { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:3000" }, body: JSON.stringify({ email: "injected@example.com", name: "Injected", password, role: "superadmin", roles: ["superadmin"] }) }));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.deepEqual((await rolesForUser(result.user.id)).map((role) => role.id), ["user"]);
});
test("unknown permissions and unauthenticated principals deny access", async () => {
  assert.equal(can(null, "dashboard.read"), false);
  assert.equal(can(user, "users.manage"), false);
  assert.equal(permissionForPath("/users-spoof"), undefined);
  assert.equal(permissionForPath("/panel/posts/comments"), "comments.read");
});
test("demo is read only even if a write permission is accidentally included", async () => {
  const response = await auth.handler(new Request("http://localhost:3000/api/auth/sign-in/anonymous", { method: "POST", headers: { Origin: "http://localhost:3000", "Content-Type": "application/json" }, body: "{}" }));
  assert.equal(response.status, 200);
  const { user: anonymous } = await response.json();
  const demo = { ...(await principal(anonymous.id)), demo: true };
  assert.deepEqual(demo.roles.map((role) => role.id), ["demo"]);
  assert.equal(can(demo, "posts.read"), true);
  assert.equal(can({ ...demo, permissions: owner.permissions }, "posts.delete"), false);
  assert.equal(can(demo, "users.read"), false);
  assert.equal(can({ ...demo, permissions: owner.permissions }, "roles.read"), false);
  assert.equal(can({ ...demo, permissions: owner.permissions }, "audit.read"), false);
  assert.equal(canPreviewPage(demo, "users.read"), true);
  assert.equal(canPreviewPage(demo, "roles.read"), true);
  assert.equal(canPreviewPage(demo, "audit.read"), false);
  assert.equal(canPreviewPage(demo, "posts.create"), false);
  assert.equal(canPreviewPage(null, "users.read"), false);
  assert.equal(canPreviewPage(user, "users.read"), false);
  const demoLinks = accessibleNavGroups(demo).flatMap((group) => group.items.map((item) => item.href));
  assert.ok(demoLinks.includes("/panel/users"));
  assert.ok(demoLinks.includes("/panel/roles"));
  const userLinks = accessibleNavGroups(user).flatMap((group) => group.items.map((item) => item.href));
  assert.equal(userLinks.includes("/panel/users"), false);
  assert.equal(userLinks.includes("/panel/roles"), false);
  await fail(() => saveRole(demo, { name: "Forbidden", description: "", permissions: [] }));
  await fail(() => assignRoles(demo, user.id, ["admin"]));
});

test("demo fixtures stay independent of private accounts and custom roles in every language", async () => {
  const id = await saveRole(owner, { name: "Private role", description: "Must never appear in demo previews", permissions: ["dashboard.read"] });
  try {
    for (const copy of Object.values(accessMessages)) {
      const sample = demoAccessData(copy);
      assert.ok(sample.users.length > 0);
      assert.ok(sample.roles.some((role) => !role.system));
      assert.ok(sample.users.every((entry) => entry.id.startsWith("sample-") && entry.email.endsWith("@example.test")));
      assert.equal(sample.roles.some((role) => role.id === id), false);
      assert.ok(sample.roles.every((role) => role.name && role.description));
    }
    const sample = demoAccessData(accessMessages.en);
    sample.roles[0].permissions.length = 0;
    assert.ok(systemRoles.find((role) => role.id === "superadmin")!.permissions.length > 0);
    assert.ok(demoAccessData(accessMessages.en).roles[0].permissions.length > 0);
  } finally {
    await deleteRole(owner, id);
  }
});
test("built-in policies cannot be changed or deleted", async () => {
  for (const role of systemRoles) {
    await fail(() => saveRole(owner, { ...role }));
    await fail(() => deleteRole(owner, role.id));
  }
});
test("admin cannot grant superadmin or edit owner; self changes are blocked", async () => {
  await fail(() => assertGrantable(admin, systemRoles.find((role) => role.id === "superadmin")!));
  await fail(() => assignRoles(admin, user.id, ["superadmin"]));
  await fail(() => assignRoles(admin, owner.id, ["user"]));
  await fail(() => assignRoles(owner, owner.id, ["user"]));
  assert.deepEqual((await rolesForUser(owner.id)).map((role) => role.id), ["superadmin"]);
});
test("custom role lifecycle, multiple roles, revocation and transactional audit", async () => {
  const id = await saveRole(admin, { name: "Content reader", description: "Review content", permissions: ["posts.read", "media.read"] });
  await assignRoles(owner, user.id, ["user", id]);
  assert.equal(can(await principal(user.id), "posts.read"), true);
  assert.equal(can(await principal(user.id), "media.read"), true);
  await fail(() => deleteRole(owner, id), 409);
  await saveRole(owner, { id, name: "Content reader", description: "Narrowed", permissions: ["posts.read"] });
  assert.equal(can(await principal(user.id), "media.read"), false);
  assert.equal(can(await principal(user.id), "dashboard.read"), true);
  const count = (await listAudit()).length;
  await fail(() => saveRole(owner, { name: "Content reader", description: "Duplicate", permissions: [] }), 409);
  assert.equal((await listAudit()).length, count);
  await assignRoles(owner, user.id, ["user"]);
  await deleteRole(owner, id);
  assert.equal((await listRoles()).some((role) => role.id === id), false);
  assert.ok((await listAudit()).some((entry) => entry.action === "role.deleted"));
  assert.equal(Object.getPrototypeOf((await listAudit())[0]), Object.prototype, "audit DTOs must serialize through React Server Components");
});
test("invalid permission dependencies, reserved power and unknown assignments are denied", async () => {
  await fail(() => saveRole(owner, { name: "Broken writer", description: "", permissions: ["posts.delete"] }), 400);
  await fail(() => saveRole(owner, { name: "Hidden owner", description: "", permissions: ["system.manage"] }));
  await fail(() => assignRoles(owner, user.id, ["missing"]), 400);
  await fail(() => assignRoles(owner, user.id, []), 400);
});
test("revoked permissions invalidate previously loaded principals", async () => {
  const stale = await principal(admin.id);
  await assignRoles(owner, admin.id, ["user"]);
  await fail(() => saveRole(stale, { name: "Stale admin", description: "", permissions: ["dashboard.read"] }));
});
test("real login session is revoked by sign-out", async () => {
  const response = await auth.handler(new Request("http://localhost:3000/api/auth/sign-in/email", { method: "POST", headers: { Origin: "http://localhost:3000", "Content-Type": "application/json" }, body: JSON.stringify({ email: user.email, password }) }));
  assert.equal(response.status, 200);
  const cookie = response.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
  const headers = new Headers({ cookie, Origin: "http://localhost:3000" });
  assert.equal((await auth.api.getSession({ headers }))?.user.id, user.id);
  await auth.api.signOut({ headers });
  assert.equal(await auth.api.getSession({ headers }), null);
});
