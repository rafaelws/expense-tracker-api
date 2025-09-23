import type {
  FastifyError,
  FastifyReply,
  FastifyRequest,
  FastifySchemaValidationError,
} from "fastify";
import {
  AuthenticationError,
  InvalidParameterError,
  ResourceNotFoundError,
  ValidationError,
} from "@/lib/errors";

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

const validationToStr = ({
  instancePath,
  keyword,
  message,
}: FastifySchemaValidationError) => {
  return `${instancePath}: ${message} (${keyword})`;
};

export function errorHandler(
  err: FastifyError,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  if (err.validation) {
    return reply
      .status(400)
      .send({ message: err.validation.map(validationToStr).join("\n") });
  }

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
