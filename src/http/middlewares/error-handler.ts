import type {
  FastifyError,
  FastifyReply,
  FastifyRequest,
  FastifySchemaValidationError,
} from "fastify";
import { errorToStatus } from "../lib/adapter";

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
