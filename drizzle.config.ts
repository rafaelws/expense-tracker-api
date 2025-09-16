import { defineConfig } from "drizzle-kit";
import { cfg } from "@/config";

export default defineConfig({
  out: ".drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: cfg.databaseUrl,
  },
});
