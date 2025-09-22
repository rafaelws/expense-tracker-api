import { logger } from "@/lib/logger";

import { jwt } from "./jwt";

export function auth(authHeader?: string): string | null {
  // no token provided
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authHeader.split(" ")[1];
    const id = jwt.verify(token);
    return id ?? null;
  } catch (err) {
    logger.warn(
      {
        origin: "auth-validator",
        err,
      },
      "JWT exception occurred (expired, invalid, other)",
    );
  }
  return null;
}
