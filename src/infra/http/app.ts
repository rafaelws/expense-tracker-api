import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import httpLoggerMiddleware from "./common/http-logger-middleware";
import { usersRouter } from "./routes/users";

function httpServer() {
  const app = express();
  app.use(helmet());
  app.use(compression());
  app.use(cors());
  app.use(express.json());
  app.use(httpLoggerMiddleware);
  app.use(usersRouter);

  return app;
}

export const app = httpServer();
