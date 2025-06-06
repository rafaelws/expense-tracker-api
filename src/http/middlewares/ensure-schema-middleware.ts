import { NextFunction } from "express";
import { z, ZodObject } from "zod/v4";

import { HandlerRequest, HandlerResponse } from "../lib/types";

export const ensureBodySchema = (schema: ZodObject) => {
  return (
    req: HandlerRequest<z.infer<typeof schema>>,
    res: HandlerResponse,
    next: NextFunction,
  ) => {
    const { data, error } = schema.safeParse(req.body);
    if (error) {
      const message = z.prettifyError(error);
      res.status(400).json({ message });
      return;
    }
    req.body = data;
    next();
  };
};

export const ensureQuerySchema = (schema: ZodObject) => {
  return (
    req: HandlerRequest<unknown, z.infer<typeof schema>>,
    res: HandlerResponse,
    next: NextFunction,
  ) => {
    const { data, error } = schema.safeParse(req.query);
    if (error) {
      const message = z.prettifyError(error);
      res.status(400).json({ message });
      return;
    }
    req.query = data;
    next();
  };
};
