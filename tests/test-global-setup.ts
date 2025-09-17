import { runMigrations } from "../src/db/migrate";

export default async function () {
  await runMigrations();

  // return async () => {
  //   await closeTestServer();
  // };
}
