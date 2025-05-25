import knex from "knex";
import pg from "pg";

import config from "./config";

// 1082 = DATE (use string)
pg.types.setTypeParser(1082, (val) => val);

export const db = knex(config);
