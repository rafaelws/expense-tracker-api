import arp from "app-root-path";
import { config } from "dotenv";
import path from "path";
import { z } from "zod";

import { logger } from "./lib/logger";

const { NODE_ENV } = process.env;

if (NODE_ENV === "test") {
  config({ path: path.join(arp.path, ".env.test.local") });
} else {
  config({ path: path.join(arp.path, ".env.local") });
}

const envSchema = z.object({
  PORT: z.coerce.number().positive().int().min(3000).default(3000),
  JWT_SECRET: z.string().min(64),
  NODE_ENV: z.enum(["development", "test", "production"], {
    message: "NODE_ENV should be development, test or production",
  }),
  DATABASE_URL: z.string(),
});

const { success, data, error } = envSchema.safeParse(process.env);

if (success === false) {
  logger.error("[ENV] invalid configuration: %o", error.issues);
  process.exit(1);
}

export const cfg = {
  jwtSecret: data.JWT_SECRET,
  port: data.PORT,
  env: data.NODE_ENV,
  databaseUrl: data.DATABASE_URL,
} as const;
