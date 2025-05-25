import { Router } from "express";

import {
  authenticateUserSchema,
  createUserSchema,
} from "@/features/users/user-schema";
import { ensureBodySchema } from "@/http/middlewares/ensure-schema-middleware";

import { postAuthenticate, postUser } from "./user-http-handlers";

export const usersRouter = Router();

usersRouter.post("/users", ensureBodySchema(createUserSchema), postUser);

usersRouter.post(
  "/auth",
  ensureBodySchema(authenticateUserSchema),
  postAuthenticate,
);
