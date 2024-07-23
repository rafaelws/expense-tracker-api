import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

import { badRequest, formatZodIssues } from "@/infra/common";

export function ensureSchema(validationSchema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { success, data, error } = validationSchema.safeParse(req.body);

    if (success === false || !data)
      return badRequest(
        res,
        error ? formatZodIssues(error?.issues) : "Bad request",
      );

    req.body = data;
    next();
  };
}
