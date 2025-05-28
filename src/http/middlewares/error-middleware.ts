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
    next(err);
    return;
  }

  // TODO getHttpStatusFor(err)
  if (err instanceof ResourceNotFoundError) {
    res.status(404).json({ message: err.message });
    return;
  }

  if (err instanceof InvalidParameterError) {
    res.status(400).json({ message: err.message });
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
