import { betterAuth } from "better-auth";
import { anonymous } from "better-auth/plugins";
import { brandConfig } from "@/config/brand";
import { authDatabase } from "./access/database";
import { addInitialRole } from "./access/repository";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

function secret() {
  if (process.env.BETTER_AUTH_SECRET) return process.env.BETTER_AUTH_SECRET;
  if (process.env.NODE_ENV === "production") throw new Error("BETTER_AUTH_SECRET must be configured in production.");
  mkdirSync(".data", { recursive: true });
  try { return readFileSync(".data/auth-secret", "utf8"); }
  catch {
    const value = randomBytes(48).toString("base64url");
    try { writeFileSync(".data/auth-secret", value, { flag: "wx", mode: 0o600 }); return value; }
    catch { return readFileSync(".data/auth-secret", "utf8"); }
  }
}

export const auth = betterAuth({
  appName: brandConfig.name,
  secret: secret(),
  baseURL: process.env.BETTER_AUTH_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  database: authDatabase(),
  emailAndPassword: { enabled: true, minPasswordLength: 10, maxPasswordLength: 128 },
  // Permissions are read from the database on each request, never trusted from cached cookies.
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24, cookieCache: { enabled: false } },
  rateLimit: { enabled: true, storage: "database", window: 60, max: 60, customRules: { "/panel/sign-in/email": { window: 60, max: 5 }, "/panel/sign-up/email": { window: 60, max: 3 }, "/panel/sign-in/anonymous": { window: 60, max: 5 } } },
  plugins: [anonymous()],
  disabledPaths: process.env.AUTH_DEMO_ENABLED === "false" ? ["/panel/sign-in/anonymous"] : [],
  databaseHooks: {
    user: { create: { after: async (user) => { await addInitialRole(user.id, Boolean((user as typeof user & { isAnonymous?: boolean }).isAnonymous)); } } },
  },
});
