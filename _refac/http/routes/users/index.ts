import { Router } from "express";

import { ensureSchema } from "../../middlewares";
import { authenticateHandler } from "./post-authenticate";
import { createUserHandler } from "./post-create-user";
import { authSchema, createUserSchema } from "./schemas";
import { UserUseCaseFactory } from "./UserUseCaseFactory";

export const usersRouter = Router();

const createUser = UserUseCaseFactory.createUser();
const authenticate = UserUseCaseFactory.authenticate();

usersRouter.post(
  "/users",
  ensureSchema(createUserSchema),
  createUserHandler(createUser),
);

usersRouter.post(
  "/auth",
  ensureSchema(authSchema),
  authenticateHandler(authenticate),
);
