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
  if (!authHeader) {
    res.sendStatus(401);
    return;
  }
  if (!authHeader.startsWith("Bearer ")) {
    res.sendStatus(401);
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const id = jwt.verify(token);
    if (id) {
      res.locals.userId = id;
      next();
    } else {
      // invalid or expired
      res.sendStatus(401);
    }
  } catch (err) {
    logger.warn(
      {
        origin: "jwt-middleware",
        err,
      },
      "JWT exception occurred (expired, invalid, other)",
    );
    res.sendStatus(401);
  }
}
