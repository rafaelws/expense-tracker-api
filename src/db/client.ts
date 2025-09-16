import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { cfg } from "@/config";
import * as schema from "./schema";

// const pool = new Pool({ connectionString: cfg.databaseUrl });
// export const db = drizzle({
//   connection: cfg.databaseUrl,
//   schema,
// });
// export const db = drizzle({ client: pool, schema });

// 1082 = DATE (use string)
pg.types.setTypeParser(1082, (val) => val);

export const db = drizzle({ connection: cfg.databaseUrl, schema });

export type Transaction = Parameters<
  Parameters<(typeof db)["transaction"]>[0]
>[0];
