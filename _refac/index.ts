import { cfg, logger } from "@/infra/common";

import { app } from "./http/app";

function main() {
  app.listen(cfg.port, () => {
    if (cfg.env === "development")
      logger.info(`server up on port: ${cfg.port}`);
  });
}

main();
