import { Router } from "express";

import { authenticateHandler } from "./post-authenticate";
import { createUserHandler } from "./post-create-user";
import { UserUseCaseFactory } from "./UserUseCaseFactory";

export const usersRouter = Router();

const createUser = UserUseCaseFactory.createUser();
const authenticate = UserUseCaseFactory.authenticate();

usersRouter.post("/users", createUserHandler(createUser));
usersRouter.post("/auth", authenticateHandler(authenticate));
