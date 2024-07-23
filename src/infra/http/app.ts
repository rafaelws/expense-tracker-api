import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { httpLoggerMiddleware } from "./middlewares";
import { expensesRouter, usersRouter } from "./routes";

function httpServer() {
  const app = express();
  app.use(helmet());
  app.use(compression());
  app.use(cors());
  app.use(express.json());
  app.use(httpLoggerMiddleware);
  app.use(usersRouter);
  app.use(expensesRouter);

  return app;
}

export const app = httpServer();
