import { NextFunction, Request, Response } from "express";
import { ZodIssue, ZodSchema } from "zod";

const formatZodIssue = (issue: ZodIssue): string => {
  const { path, message } = issue;
  const pathString = path.join(".");

  return pathString ? `${pathString}: ${message}` : message;
};

export function ensureBodySchema(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { data, error } = schema.safeParse(req.body);

    if (error) {
      const message = error.issues.map(formatZodIssue).join(", ");
      return res.status(400).json({ message });
    }

    req.body = data;
    next();
  };
}
