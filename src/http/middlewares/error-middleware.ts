import { NextFunction, Request, Response } from "express";

import { logger } from "@/lib/logger";

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // TODO // if (err instanceof AppError) {}
  if (res.headersSent) {
    return next(err);
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
  return res.status(500).json({ message: "Internal server error" });
}
