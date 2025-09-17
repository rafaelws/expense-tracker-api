import { cfg } from "./config";
import { runMigrations } from "./db/migrate";
import { listen } from "./http/server";

async function main() {
  try {
    if (cfg.env === "development") {
      await runMigrations();
    }

    const host = cfg.env === "production" ? "0.0.0.0" : "localhost";
    await listen(cfg.port, host);
  } catch (e) {
    console.error("could not start application", e);
    process.exit(1);
  }
}

main();
