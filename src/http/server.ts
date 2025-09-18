// import spec from "docs/openapi.json";

import fastifyCompress from "@fastify/compress";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastify from "fastify";
import { cfg } from "@/config";
import { logger } from "@/lib/logger";
import { errorHandler } from "./middlewares/error-handler";
import httpDevLoggerHook from "./middlewares/http-dev-logger";
import { httpLogger } from "./middlewares/http-logger";
import { notFoundHandler } from "./middlewares/not-found-handler";
import expensesRouter from "./routes/expenses";
import tagsRouter from "./routes/tags";
import usersRouter from "./routes/users";
import walletsRouter from "./routes/wallets";

export async function createServer() {
  const app = fastify({ loggerInstance: httpLogger });

  if (cfg.env === "development") {
    app.addHook("onResponse", httpDevLoggerHook);
  }

  await app.register(fastifyHelmet);
  await app.register(fastifyCompress);
  // TODO { origin: ["https://frontend.com"], methods: ["GET", "POST", "PUT", "DELETE"], credentials: true }
  await app.register(fastifyCors);

  app.get("/health", (_, reply) => {
    return reply.send("OK");
  });

  // TODO swagger/openapi

  await app.register(usersRouter);
  await app.register(expensesRouter);
  await app.register(walletsRouter);
  await app.register(tagsRouter);

  app.setNotFoundHandler(notFoundHandler);
  app.setErrorHandler(errorHandler);

  return app;
}

export const server = await createServer();

export const listen = async (port = 3000, host = "localhost") => {
  await server.ready();
  await server.listen({ port, host });
  logger.info(`listening on "${host}:${port}"`);
};
