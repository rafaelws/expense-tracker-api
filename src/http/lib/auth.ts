import { AuthenticationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

import { jwt } from "./jwt";

export function auth(headers?: Record<string, string>): string {
  const authHeader = headers?.authorization;

  // no token provided
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthenticationError();
  }

  const token = authHeader.split(" ")[1];

  try {
    const id = jwt.verify(token);
    if (id) {
      return id;
    } else {
      // invalid or expired
      throw new AuthenticationError();
    }
  } catch (err) {
    logger.warn(
      {
        origin: "auth-validator",
        err,
      },
      "JWT exception occurred (expired, invalid, other)",
    );
    throw new AuthenticationError();
  }
}
