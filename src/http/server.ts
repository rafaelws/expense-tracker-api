import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import fastifyAutoload from "@fastify/autoload";
import fastifyCompress from "@fastify/compress";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifySwagger from "@fastify/swagger";
import fastify from "fastify";
import { cfg } from "@/config";
import { logger } from "@/lib/logger";
import { swaggerOptions } from "./lib/openapi";
import { registerSchemas } from "./lib/openapi/schema-registry";
import { errorHandler } from "./middlewares/error-handler";
import httpDevLoggerHook from "./middlewares/http-dev-logger";
import { httpLogger } from "./middlewares/http-logger";
import { notFoundHandler } from "./middlewares/not-found-handler";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type ServerLike = Awaited<ReturnType<typeof createServer>>;

export async function createServer() {
  const app = fastify({ loggerInstance: httpLogger });

  registerSchemas(app);

  if (cfg.env === "development") {
    app.addHook("onResponse", httpDevLoggerHook);
  }

  await app.register(fastifyHelmet);
  await app.register(fastifyCompress);
  // TODO { origin: ["https://frontend.com"], methods: ["GET", "POST", "PUT", "DELETE"], credentials: true }
  await app.register(fastifyCors);
  await app.register(fastifySwagger, swaggerOptions);

  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);

  // app.get("/health", (_, reply) => reply.send("OK"));

  await app.register(fastifyAutoload, {
    dir: join(__dirname, "routes"),
  });

  app.get("/docs/json", (_, reply) => reply.send(app.swagger()));

  return app;
}

export const server = await createServer();

export const listen = async (port = 3000, host = "localhost") => {
  await server.ready();
  await server.listen({ port, host });
  logger.info(`listening on "${host}:${port}"`);
};
