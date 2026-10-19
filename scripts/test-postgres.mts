import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { Pool } from "pg";

const source = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!source) throw new Error("Configure DATABASE_URL_UNPOOLED or DATABASE_URL to run PostgreSQL integration tests.");
const schema = `kitravo_test_${randomBytes(8).toString("hex")}`;
const pool = new Pool({ connectionString: source, max: 1 });
try {
  // This generated schema is isolated from application tables and removed afterward.
  await pool.query(`CREATE SCHEMA "${schema}"`);
  const url = new URL(source);
  url.searchParams.set("options", `-c search_path=${schema}`);
  const code = await new Promise<number>((resolve, reject) => {
    const child = spawn(process.execPath, ["--import", "tsx", "--test", "tests/access.test.mts"], {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: url.toString(), AUTH_DATABASE_PATH: "", KITRAVO_TEST_POSTGRES: "true", VERCEL: "" },
    });
    child.once("error", reject);
    child.once("exit", (status) => resolve(status ?? 1));
  });
  process.exitCode = code;
} finally {
  await pool.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  await pool.end();
}
