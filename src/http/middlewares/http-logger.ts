import pino from "pino";
import { cfg } from "@/config";

const pretty =
  cfg.env === "development" ? { transport: { target: "pino-pretty" } } : {};

export const httpLogger = pino({
  enabled: cfg.env !== "test",
  ...pretty,
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});
