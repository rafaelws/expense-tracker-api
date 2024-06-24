import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  PORT: z.preprocess(
    (val) => Number(val),
    z.number().positive().int().min(3000),
  ),
  JWT_SECRET: z.string().min(64),
  NODE_ENV: z.string(),
});

const { success, data, error } = envSchema.safeParse(process.env);

if (!success) {
  // FIXME logger
  // eslint-disable-next-line
  console.error("invalid env variable configuration:", error.format());
  process.exit(1);
}

const cfg = {
  jwtSecret: data.JWT_SECRET,
  port: data.PORT,
  env: data.NODE_ENV,
} as const;

export default cfg;
