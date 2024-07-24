import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

import { badRequest, validateSchema } from "@/infra/common";

export function ensureSchema(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const [error, data] = validateSchema(schema, req.body);

    if (data === null) {
      return badRequest(res, error || "Bad request");
    }

    req.body = data;
    next();
  };
}
