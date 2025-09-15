import { createRequire } from "node:module";
import knex from "knex";
import pg from "pg";

const crequire = createRequire(import.meta.url);
const config = crequire("../knexfile.cjs");

// 1082 = DATE (use string)
pg.types.setTypeParser(1082, (val) => val);

export const db = knex(config);
