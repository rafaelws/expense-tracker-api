import { NextFunction, Request, Response } from "express";

import { logger } from "@/lib/logger";

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    next(err);
    return;
  }

  logger.error(
    {
      origin: "http-middleware",
      err,
      req: {
        method: req.method,
        url: req.originalUrl,
      },
    },
    "Unexpected error occurred",
  );
  res.status(500).json({ message: "Internal server error" });
}
