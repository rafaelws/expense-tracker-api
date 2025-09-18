import pino from "pino";
import { cfg } from "@/config";

export const httpLogger = pino({
  level: "error",
  enabled: cfg.env === "production",
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        reqId: req.id,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});
