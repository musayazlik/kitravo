import { AsyncLocalStorage } from "node:async_hooks";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Pool, type PoolClient } from "pg";
import { attachDatabasePool } from "@vercel/functions";

type Value = string | number | bigint | boolean | null;
type Row = Record<string, unknown>;
type TransactionContext = { sqlite: true } | { client: PoolClient };
const context = new AsyncLocalStorage<TransactionContext>();
const globals = globalThis as typeof globalThis & { accessDb?: DatabaseSync; accessPool?: Pool };
let sqliteQueue = Promise.resolve();

export function usesPostgres() {
  return Boolean(process.env.DATABASE_URL) && process.env.AUTH_DATABASE_PATH !== ":memory:";
}

/** SQLite is a local-development option; Vercel must use shared PostgreSQL. */
export function database() {
  if (process.env.VERCEL) throw new Error("DATABASE_URL must be configured on Vercel; local SQLite is not durable there.");
  if (!globals.accessDb) {
    const path = process.env.AUTH_DATABASE_PATH ?? resolve(".data/auth.sqlite");
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    globals.accessDb = new DatabaseSync(path);
    globals.accessDb.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;");
  }
  return globals.accessDb;
}

function pool() {
  if (!globals.accessPool) {
    globals.accessPool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 15000, allowExitOnIdle: true });
    if (process.env.VERCEL) attachDatabasePool(globals.accessPool);
  }
  return globals.accessPool;
}

export function authDatabase() {
  return usesPostgres() ? pool() : database();
}

async function withSqliteLock<T>(work: () => Promise<T> | T): Promise<T> {
  const previous = sqliteQueue;
  let release!: () => void;
  sqliteQueue = new Promise<void>((resolve) => { release = resolve; });
  await previous;
  try { return await work(); } finally { release(); }
}

/** Application SQL uses positional question marks; identifiers are explicitly quoted for both engines. */
export async function query<T extends Row = Row>(statement: string, values: Value[] = []): Promise<T[]> {
  const active = context.getStore();
  if (usesPostgres()) {
    let index = 0;
    const text = statement.replace(/\?/g, () => `$${++index}`);
    const client = active && "client" in active ? active.client : pool();
    return (await client.query(text, values)).rows as T[];
  }
  const run = () => database().prepare(statement).all(...values.map((value) => typeof value === "boolean" ? Number(value) : value)).map((row) => ({ ...row })) as T[];
  return active && "sqlite" in active ? run() : withSqliteLock(run);
}

export async function executeSchema(statement: string) {
  if (usesPostgres()) await pool().query(statement);
  else await withSqliteLock(() => database().exec(statement));
}

/** Serialize policy mutations so a revoked grant cannot be used by a competing write. */
export async function transaction<T>(work: () => Promise<T>): Promise<T> {
  if (context.getStore()) throw new Error("Nested access transactions are not supported.");
  if (usesPostgres()) {
    const client = await pool().connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(1197588822)");
      const result = await context.run({ client }, work);
      await client.query("COMMIT");
      return result;
    } catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
  }
  return withSqliteLock(async () => {
    const db = database();
    db.exec("BEGIN IMMEDIATE");
    try { const result = await context.run({ sqlite: true }, work); db.exec("COMMIT"); return result; }
    catch (error) { db.exec("ROLLBACK"); throw error; }
  });
}

export async function closeDatabase() {
  if (globals.accessPool) { await globals.accessPool.end(); globals.accessPool = undefined; }
  if (globals.accessDb) { globals.accessDb.close(); globals.accessDb = undefined; }
}
