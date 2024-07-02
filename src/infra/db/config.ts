// this config file is used by drizzle-kit
import { defineConfig } from "drizzle-kit";

import { cfg } from "../common";

export default defineConfig({
  dbCredentials: { url: cfg.databaseUrl },
  schema: "./src/infra/db/schema.ts",
  out: "./src/infra/db/sql",
  dialect: "postgresql",
  verbose: true,
  strict: true,
});
