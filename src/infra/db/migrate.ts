import "dotenv/config";

import process from "node:process";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { cfg } from "../common";

const migrationsFolder = "./src/infra/db/sql";
const conn = postgres(cfg.databaseUrl, { max: 1 });

const main = async () => {
  await migrate(drizzle(conn), { migrationsFolder });
  await conn.end();
  // eslint-disable-next-line
  console.log("migration concluded");
  process.exit(0);
};

main();
