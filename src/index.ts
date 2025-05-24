import { cfg } from "./config";
import { app } from "./http/server";
import { logger } from "./lib/logger";

function main() {
  app.listen(cfg.port, () => {
    logger.info(`server up on port: ${cfg.port}`);
  });
}

main();
