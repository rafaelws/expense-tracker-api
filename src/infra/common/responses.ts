import { Response } from "express";

import { logger } from "./logger";

export function badRequest(res: Response, message: string) {
  return res.status(400).json({ message });
}

export function serverError(res: Response, e: Error | unknown) {
  logger.error("Failed to process request\n", e);
  return res.sendStatus(500);
}
