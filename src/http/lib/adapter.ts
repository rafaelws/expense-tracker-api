import type { FastifyReply, FastifyRequest } from "fastify";
import {
  AuthenticationError,
  InvalidParameterError,
  ResourceNotFoundError,
  ValidationError,
} from "@/lib/errors";
import type { HttpHandler, HttpRequest, HttpResponse } from "./types";

function flattenParams(params: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  if (params && typeof params === "object") {
    for (const key in params) {
      if (Object.hasOwn(params, key)) {
        const value = (params as Record<string, unknown>)[key];
        if (value != null) result[key] = String(value);
      }
    }
  }
  return result;
}

function flattenQuery(query: any): Record<string, string> {
  const result: Record<string, string> = {};

  for (const key in query) {
    if (!Object.hasOwn(query, key)) continue;
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

export const errorToStatus = (err: unknown): [number, string] => {
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
  return async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const httpRequest: HttpRequest = {
        query: flattenQuery(req.query),
        params: flattenParams(req.params),
        body: req.body,
        headers: flattenHeaders(req.headers),
      };
      const { status, body }: HttpResponse = await handler(httpRequest);
      return reply.code(status).send(body);
    } catch (err) {
      const [status, message] = errorToStatus(err);
      if (status >= 500) {
        req.log.error(
          {
            origin: "http-adapter",
            reqId: req.id,
            err,
            req: {
              method: req.method,
              url: req.originalUrl,
            },
          },
          "Unexpected error occurred",
        );
      }
      return reply.code(status).send({ message });
    }
  };
}
