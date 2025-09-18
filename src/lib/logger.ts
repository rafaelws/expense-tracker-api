import pino from "pino";

const devTransport = {
  target: "pino-pretty",
  options: {
    translateTime: "SYS:dd-mm-yyyy HH:MM:ss.l",
    colorize: true,
    ignore: "pid,hostname",
  },
};

export const logger = pino({
  transport: process.env.NODE_ENV === "production" ? undefined : devTransport,
  level: process.env.LOG_LEVEL || "info",
});
