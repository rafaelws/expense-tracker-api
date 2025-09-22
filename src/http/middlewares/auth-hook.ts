import type { FastifyInstance, onRequestHookHandler } from "fastify";
import { auth } from "../lib/auth";

export const setAuthDecorator = (fastify: FastifyInstance) => {
  fastify.decorateRequest("userId", null);
};

export const authHook: onRequestHookHandler = async (req, reply) => {
  const userId = auth(req.headers.authorization);
  if (!userId) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
  req.userId = userId;
};

export const setAuthHook = (fastify: FastifyInstance) => {
  setAuthDecorator(fastify);
  fastify.addHook("onRequest", authHook);
};
