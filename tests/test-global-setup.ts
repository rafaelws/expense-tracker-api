import { runMigrations } from "../src/db/migrate";

export default async function setup() {
  await runMigrations();
}
