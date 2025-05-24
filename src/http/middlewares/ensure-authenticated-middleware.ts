import { NextFunction, Request, Response } from "express";

import { jwt } from "../../lib/jwt";
import { logger } from "../../lib/logger";

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    try {
      const id = jwt.verify(token);
      // invalid or expired
      if (!id) return res.sendStatus(403);
      req.userId = id;
      next();
    } catch (err) {
      logger.error("jwt middleware error\n", err);
      return res.sendStatus(403);
    }
  } else {
    // no token provided
    return res.sendStatus(401);
  }
}
