import { config } from "dotenv";
import { z } from "zod";

const { NODE_ENV: nodeEnv } = process.env;

if (nodeEnv === "test") config({ path: ".env.test.local" });
else config({ path: ".env.local" });

const envSchema = z.object({
  PORT: z.coerce.number().positive().int().min(3000),
  JWT_SECRET: z.string().min(64),
  NODE_ENV: z.enum(["development", "test", "production"], {
    message: "NODE_ENV should be development, test or production",
  }),
  DATABASE_URL: z.string(),
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
  databaseUrl: data.DATABASE_URL,
} as const;
