import { NextFunction } from "express";

import { logger } from "../../lib/logger";
import { jwt } from "../lib/jwt";
import { HandlerRequest, HandlerResponse } from "../lib/types";

export function ensureAuthenticated(
  req: HandlerRequest,
  res: HandlerResponse,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  // no token provided
  if (!authHeader) return res.sendStatus(401);
  if (!authHeader.startsWith("Bearer ")) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];

  try {
    const id = jwt.verify(token);
    // invalid or expired
    if (!id) return res.sendStatus(401);
    res.locals.userId = id;
    next();
  } catch (err) {
    logger.warn(
      {
        origin: "jwt-middleware",
        err,
      },
      "JWT exception occurred (expired, invalid, other)",
    );
    return res.sendStatus(401);
  }
}
