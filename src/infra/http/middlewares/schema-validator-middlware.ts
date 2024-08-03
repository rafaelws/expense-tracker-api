import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

import { validateSchema } from "@/infra/common";

import { badRequest } from "../common";

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
