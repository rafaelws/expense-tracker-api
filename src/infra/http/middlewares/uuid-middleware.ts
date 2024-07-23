import { NextFunction, Request, Response } from "express";

import { badRequest, validateUUID } from "@/infra/common";

export function ensureValidId(req: Request, res: Response, next: NextFunction) {
  if (!validateUUID(req.params.id))
    return badRequest(res, "Invalid id parameter");
  next();
}
