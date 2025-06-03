import { writeFileSync } from "node:fs";

import { openApi } from ".";

const output = JSON.stringify(openApi, null, 2);

writeFileSync("docs/openapi.json", output, {
  encoding: "utf-8",
});
