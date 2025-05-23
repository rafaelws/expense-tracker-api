import { hrtime } from "node:process";

import { NextFunction, Request, Response } from "express";

import { cfg, logger } from "@/infra/common";

const NS_PER_SEC = 1e9;
const NANOSECOND = 1;
const MICROSECOND = 1e3 * NANOSECOND;
const MILLISECOND = 1e3 * MICROSECOND;
const SECOND = 1e3 * MILLISECOND;
/**
 * Formats a duration in nanoseconds to a human-readable string.
 *
 * @param durationInNanoseconds - The duration in nanoseconds to format.
 *
 * @returns A string representing the formatted duration.
 */
function duration(durationInNanoseconds: number): string {
  if (durationInNanoseconds >= SECOND) {
    return `${(durationInNanoseconds / SECOND).toPrecision(2)}s`;
  } else if (durationInNanoseconds >= MILLISECOND) {
    return `${(durationInNanoseconds / MILLISECOND).toPrecision(4)}ms`;
  } else if (durationInNanoseconds >= MICROSECOND) {
    return `${(durationInNanoseconds / MICROSECOND).toPrecision(4)}µs`;
  } else {
    return `${durationInNanoseconds.toPrecision(4)}ns`;
  }
}

/**
 * Formats log message for HTTP requests.
 *
 * @param method - HTTP method of the request.
 * @param url - URL of the request.
 * @param query - Query parameters of the request.
 * @param statusCode - HTTP status code of the response.
 * @param ns - Time taken for the request in nanoseconds.
 *
 * @returns Formatted log message.
 */
function format(method: string, url: string, statusCode: number, ns: number) {
  return `${method} ${url} - ${statusCode} - ${duration(ns)}`;
}

export function httpLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (cfg.env === "development") {
    const time = hrtime();

    res.on("finish", () => {
      const diff = process.hrtime(time);
      const ns = diff[0] * NS_PER_SEC + diff[1];
      logger.info(format(req.method, req.url, res.statusCode, ns));
    });
  }
  next();
}
