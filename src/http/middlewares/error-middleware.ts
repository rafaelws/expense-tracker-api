import { NextFunction, Request, Response } from "express";

import { unexpectedErrorLogger } from "@/lib/logger";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  // if (err instanceof AppError) {}
  if (res.headersSent) {
    return next(err);
  }
  unexpectedErrorLogger.error("Unexpected error (500) %o", err);
  return res.sendStatus(500);
  /*
  return res.status(500).json({
    message: "Internal Server Error",
    ...(process.env.NODE_ENV === 'development' && { 
      error: err instanceof Error ? err.toString() : err,
      stack: err instanceof Error ? err.stack : undefined
    })
  });
  */
}
