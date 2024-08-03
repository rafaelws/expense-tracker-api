import { Response } from "express";

import { cfg } from "@/infra/common";

import { logger } from "../../common/logger";

export function badRequest(res: Response, message: string) {
  return res.status(400).json({ message });
}

export function serverError(res: Response, e: Error | unknown) {
  logger.error("Failed to process request\n", e);
  let message = "Internal Server Error";

  if (cfg.env === "test") message = (e as Error).message;

  return res.status(500).json({ message });
}
