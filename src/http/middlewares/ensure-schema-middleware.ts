import { NextFunction, Request, Response } from "express";
import { ZodIssue, ZodSchema } from "zod";

const formatZodIssue = (issue: ZodIssue): string => {
  const { path, message } = issue;
  const pathString = path.join(".");

  return pathString ? `${pathString}: ${message}` : message;
};

function ensureSchema(schema: ZodSchema, where: "body" | "query") {
  return (req: Request, res: Response, next: NextFunction) => {
    const { data, error } = schema.safeParse(req[where]);

    if (error) {
      const message = error.issues.map(formatZodIssue).join(", ");
      return res.status(400).json({ message });
    }

    req[where] = data;
    next();
  };
}

export const ensureBodySchema = (schema: ZodSchema) =>
  ensureSchema(schema, "body");

export const ensureQuerySchema = (schema: ZodSchema) =>
  ensureSchema(schema, "query");
