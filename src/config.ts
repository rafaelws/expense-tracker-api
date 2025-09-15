import { z } from "zod";

import { logger } from "./lib/logger";

const { NODE_ENV: env } = process.env;

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
  logger.error(`config: invalid configuration\n${z.prettifyError(error)}`);
  process.exit(1);
}

export const cfg = {
  env,
  jwtSecret: data.JWT_SECRET,
  port: data.PORT,
  databaseUrl: data.DATABASE_URL,
} as const;
