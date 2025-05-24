import { cfg } from "@/config";

export default {
  client: "pg",
  connection: cfg.databaseUrl,
  migrations: {
    extension: "ts",
  },
};
