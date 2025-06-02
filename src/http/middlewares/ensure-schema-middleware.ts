import { NextFunction, Request, Response } from "express";
import { z, ZodObject } from "zod/v4";

function ensureSchema(schema: ZodObject, where: "body" | "query") {
  return (req: Request, res: Response, next: NextFunction) => {
    const { data, error } = schema.safeParse(req[where]);

    if (error) {
      const message = z.prettifyError(error);
      res.status(400).json({ message });
      return;
    }

    req[where] = data;
    next();
  };
}

export const ensureBodySchema = (schema: ZodObject) =>
  ensureSchema(schema, "body");

export const ensureQuerySchema = (schema: ZodObject) =>
  ensureSchema(schema, "query");
