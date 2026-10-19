import { getMigrations } from "better-auth/db/migration";
import { auth } from "../src/lib/auth";
import { closeDatabase, query, transaction } from "../src/lib/access/database";
import { migrateAccess } from "../src/lib/access/repository";

try {
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
  await migrateAccess();

  // There are deliberately no default or public administrator credentials.
  const email = process.env.AUTH_BOOTSTRAP_EMAIL;
  const password = process.env.AUTH_BOOTSTRAP_PASSWORD;
  if (email && password) {
    if (!(await query('SELECT 1 FROM access_user_role WHERE "roleId"=\'superadmin\' LIMIT 1')).length) {
      if ((await query('SELECT 1 FROM "user" WHERE email=?', [email])).length) throw new Error("Bootstrap email already exists. Use a new account to avoid elevating an existing user.");
      const result = await auth.api.signUpEmail({ body: { email, password, name: process.env.AUTH_BOOTSTRAP_NAME ?? "Workspace Owner" } });
      await transaction(async () => {
        await query('DELETE FROM access_user_role WHERE "userId"=?', [result.user.id]);
        await query('INSERT INTO access_user_role ("userId","roleId") VALUES (?,\'superadmin\')', [result.user.id]);
      });
      console.log("Initial superadmin created. Remove AUTH_BOOTSTRAP_PASSWORD from the environment.");
    }
  }
  console.log("Auth and RBAC schema ready.");
} finally { await closeDatabase(); }
