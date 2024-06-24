import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { usersRouter } from "./routes/users";

function httpServer() {
  const app = express();
  app.use(helmet());
  app.use(compression());
  app.use(cors());
  app.use(express.json());
  // FIXME http logger
  app.use(usersRouter);

  return app;
}

const app = httpServer();

export default app;
