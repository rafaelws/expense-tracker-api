import { Router } from "express";

import { Authenticate } from "@/features/users/Authenticate";
import { CreateUser } from "@/features/users/CreateUser";
import { PasswordHasherService } from "@/infra/common";
import { DatabaseUserRepo } from "@/infra/database/users/DatabaseUserRepo";

import { authenticateHandler } from "./post-authenticate";
import { createUserHandler } from "./post-create-user";

export const usersRouter = Router();

const hasher = new PasswordHasherService();
const userRepo = new DatabaseUserRepo();
const createUserUC = new CreateUser(userRepo, hasher);
const authenticateUC = new Authenticate(userRepo, hasher);

usersRouter.post("/users", createUserHandler(createUserUC));
usersRouter.post("/auth", authenticateHandler(authenticateUC));
