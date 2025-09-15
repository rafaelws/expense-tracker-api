import { config } from "dotenv";

import { runMigrations } from "../src/db/migrate";

export default async function setup() {
  config({ path: `.env.test.local`, debug: true });
  await runMigrations();
}
