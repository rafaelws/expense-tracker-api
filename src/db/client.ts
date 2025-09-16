import { drizzle } from "drizzle-orm/node-postgres";
import pg, { Pool } from "pg";

import * as schema from "./schema";

// 1082 = DATE (use string)
pg.types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export type Transaction = Parameters<
  Parameters<(typeof db)["transaction"]>[0]
>[0];
