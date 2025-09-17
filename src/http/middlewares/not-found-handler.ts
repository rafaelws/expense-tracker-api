import type { FastifyReply, FastifyRequest } from "fastify";

export function notFoundHandler(_: FastifyRequest, reply: FastifyReply) {
  return reply.status(404).send({ message: "Not Found" });
}
