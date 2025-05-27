import { NextFunction, Request, Response } from "express";

export function notFoundMiddleware(
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  res.sendStatus(404);
}
