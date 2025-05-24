import pino from "pino";

const devTransport = {
  target: "pino-pretty",
  options: {
    colorize: true,
    translateTime: "HH:MM:ss",
    ignore: "pid,hostname",
  },
};

export const logger = pino({
  transport: process.env.NODE_ENV === "production" ? undefined : devTransport,
  level: process.env.LOG_LEVEL || "info",
});

export const unexpectedErrorLogger = logger.child({
  module: "unexpected-error",
});
