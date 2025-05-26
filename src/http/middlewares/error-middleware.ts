import { NextFunction, Request, Response } from "express";

import { InvalidParameterError, ResourceNotFoundError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    return next(err);
  }

  // TODO getHttpStatusFor(err)
  if (err instanceof ResourceNotFoundError) {
    return res.status(404).json({ message: err.message });
  }

  if (err instanceof InvalidParameterError) {
    return res.status(400).json({ message: err.message });
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
