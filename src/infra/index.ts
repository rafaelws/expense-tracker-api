import cfg from "@/infra/common/config";

import app from "./http/app";

function main() {
  app.listen(cfg.port, () => {
    // FIXME logger
    // eslint-disable-next-line
    console.log(`server up on port ${cfg.port}`);
  });
}

main();
