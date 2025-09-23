import pino from "pino";

const devTransport = {
  target: "pino-pretty",
  options: {
    translateTime: "SYS:dd-mm-yyyy HH:MM:ss.l",
    colorize: true,
    ignore: "pid,hostname",
  },
};

const isProd = process.env.NODE_ENV === "production";

export const logger = pino({
  level: isProd ? "error" : "info",
  transport: isProd ? undefined : devTransport,
  enabled: process.env.NODE_ENV !== "test",
});
