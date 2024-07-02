import winston, { format as logFormat } from "winston";

import { cfg } from "./config";

const createLogger = (
  // label: string,
  level: string,
) =>
  winston.createLogger({
    level,
    transports: [
      new winston.transports.Console({
        format: logFormat.combine(
          // logFormat.colorize(),
          // format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          logFormat.timestamp(),
          // logFormat.label({ label }),
          logFormat.errors({ stack: true }),
          logFormat.prettyPrint(),
          logFormat.metadata({
            // fillExcept: ["message", "level", "timestamp", "label"],
            fillExcept: ["message", "level", "timestamp"],
          }),
          logFormat.splat(),
          logFormat.printf(
            (info) => `[${info["timestamp"]}] ${info.level}: ${info.message}`,
          ),
        ),
      }),
    ],
  });

const log = createLogger("info");

export const logger = {
  info(message: string, something?: unknown) {
    if (something) log.info(`${message} %o`, something);
    else log.info(message);
  },
  error(message: string, stack: unknown) {
    if ((cfg.env === "development" || cfg.env === "test") && stack)
      log.error(`${message} %o`, stack);
    else log.error(message);
  },
};
