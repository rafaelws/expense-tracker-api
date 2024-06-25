import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().positive().int().min(3000),
  JWT_SECRET: z.string().min(64),
  NODE_ENV: z.enum(["development", "test", "production"], {
    message: "NODE_ENV should be development, test or production",
  }),
});

const { success, data, error } = envSchema.safeParse(process.env);

if (success === false) {
  // eslint-disable-next-line
  console.error("[ENV] invalid configuration:", error.issues);
  process.exit(1);
}

export const cfg = {
  jwtSecret: data.JWT_SECRET,
  port: data.PORT,
  env: data.NODE_ENV,
} as const;
