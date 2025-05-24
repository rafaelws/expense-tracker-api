import { Router } from "express";

import { UserRepository } from "@/features/users/user-repository";
import {
  authenticateUserSchema,
  createUserSchema,
} from "@/features/users/user-schema";
import { UserService } from "@/features/users/user-service";
import { ensureBodySchema } from "@/http/middlewares/ensure-body-schema-middleware";

import { authenticateUser } from "./post-authenticate-user";
import { createUser } from "./post-create-user";

export const usersRouter = Router();

const userService = new UserService(new UserRepository());

usersRouter.post(
  "/users",
  ensureBodySchema(createUserSchema),
  createUser(userService),
);

usersRouter.post(
  "/auth",
  ensureBodySchema(authenticateUserSchema),
  authenticateUser(userService),
);
