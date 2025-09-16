import { cfg } from "./config";
import { runMigrations } from "./db/migrate";
import { app } from "./http/server";
import { logger } from "./lib/logger";

async function main() {
  try {
    if (cfg.env === "development") {
      await runMigrations();
    }

    app.listen(cfg.port, () => {
      logger.info(`server up on port: ${cfg.port}`);
    });
  } catch (e) {
    console.error("could not start application", e);
    process.exit(1);
  }
}

main();
