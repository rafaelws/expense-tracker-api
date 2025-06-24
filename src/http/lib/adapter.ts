import { Request, Response } from "express";

import {
  AuthenticationError,
  InvalidParameterError,
  ResourceNotFoundError,
  ValidationError,
} from "@/lib/errors";
import { logger } from "@/lib/logger";

import { HttpHandler, HttpRequest, HttpResponse } from "./types";

// eslint-disable-next-line
function flattenQuery(query: any): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key in query) {
    const value = query[key];
    if (Array.isArray(value)) {
      result[key] = value[0];
    } else if (value !== undefined) {
      result[key] = String(value);
    }
  }
  return result;
}

function flattenHeaders(
  headers: Record<string, string | string[] | undefined>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key in headers) {
    const value = headers[key];
    if (Array.isArray(value)) {
      result[key] = value.join(", ");
    } else if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

const errorToStatus = (err: unknown): [number, string] => {
  if (err instanceof AuthenticationError) {
    return [401, err.message];
  }

  if (err instanceof ValidationError || err instanceof InvalidParameterError) {
    return [400, err.message];
  }

  if (err instanceof ResourceNotFoundError) {
    return [404, err.message];
  }

  return [500, "Internal server error"];
};

export function httpRoute(handler: HttpHandler) {
  return async (req: Request, res: Response) => {
    try {
      const httpRequest: HttpRequest = {
        query: flattenQuery(req.query),
        params: req.params ?? {},
        body: req.body,
        headers: flattenHeaders(req.headers),
      };
      const { status, body }: HttpResponse = await handler(httpRequest);
      res.status(status).json(body);
    } catch (err) {
      const [status, message] = errorToStatus(err);

      if (status >= 500) {
        logger.error(
          {
            origin: "http-adapter",
            err,
            req: {
              method: req.method,
              url: req.originalUrl,
            },
          },
          "Unexpected error occurred",
        );
      }
      res.status(status).json({ message });
    }
  };
}
