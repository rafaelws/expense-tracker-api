import { NextFunction, Request, Response } from "express";

import { validateUUID } from "@/infra/common";

import { badRequest } from "../common";

export function ensureValidId(req: Request, res: Response, next: NextFunction) {
  if (!validateUUID(req.params.id))
    return badRequest(res, "Invalid id parameter");
  next();
}
