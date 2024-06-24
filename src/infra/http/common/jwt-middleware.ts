import { NextFunction, Request, Response } from "express";

import jwt from "./jwt";

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
      if (!id) res.sendStatus(403);
      req.userId = id;
      next();
    } catch (err) {
      // FIXME logger
      return res.sendStatus(403);
    }
  } else {
    // no token provided
    res.sendStatus(401);
  }
}
