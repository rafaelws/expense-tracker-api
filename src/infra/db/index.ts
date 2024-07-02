import { DrizzleConfig, Logger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { cfg, logger } from "../common";
import * as schema from "./schema";

const conn = postgres(cfg.databaseUrl);

class SqlLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    logger.info(`${query} %o`, params);
  }
}

const drizzleConfig: DrizzleConfig<typeof schema> = { schema };
if (cfg.env === "development") drizzleConfig.logger = new SqlLogger();

export const db = drizzle(conn, { schema });
