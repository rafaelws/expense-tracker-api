import "express-async-errors";

import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorMiddleware } from "./middlewares/error-middleware";
import { httpLoggerMiddleware } from "./middlewares/logger-middleware";
import { expensesRouter } from "./routes/expenses";
import { usersRouter } from "./routes/users";

function createApp() {
  const app = express();
  app.use(httpLoggerMiddleware);
  app.use(helmet());
  app.use(compression());
  app.use(cors());
  app.use(express.json());

  app.use(usersRouter);
  app.use(expensesRouter);

  app.use(errorMiddleware);
  return app;
}

export const app = createApp();
