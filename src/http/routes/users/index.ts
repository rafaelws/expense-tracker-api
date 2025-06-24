import { Router } from "express";

import { httpRoute } from "@/http/lib/adapter";

import { postAuthenticate, postUser } from "./user-http-handlers";

export const usersRouter = Router();

usersRouter.post("/users", httpRoute(postUser));
usersRouter.post("/auth", httpRoute(postAuthenticate));
