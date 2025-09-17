import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { errorToStatus } from "../lib/adapter";

export function errorHandler(
  err: FastifyError,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const [status, message] = errorToStatus(err);
  if (status >= 500) {
    req.log.error(
      {
        origin: "http-middleware",
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
