import "express-async-errors";

import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorMiddleware } from "./middlewares/error-middleware";
import { httpLoggerMiddleware } from "./middlewares/logger-middleware";
import { notFoundMiddleware } from "./middlewares/not-found-middleware";
import { expensesRouter } from "./routes/expenses";
import { tagsRouter } from "./routes/tags";
import { usersRouter } from "./routes/users";
import { walletsRouter } from "./routes/wallets";

function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(httpLoggerMiddleware);

  app.use(helmet());
  app.use(compression());
  app.use(cors());
  // app.use(
  //   cors({
  //     origin: ["https://frontend.com"],
  //     methods: ["GET", "POST", "PUT", "DELETE"],
  //     credentials: true,
  //   }),
  // );
  app.use(express.json());

  app.get("/health", (_, res) => {
    res.send("OK");
  });

  app.use(usersRouter);
  app.use(expensesRouter);
  app.use(walletsRouter);
  app.use(tagsRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);
  return app;
}

export const app = createApp();
