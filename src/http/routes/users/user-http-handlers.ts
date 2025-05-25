import { Response } from "express";

import { UserRepository } from "@/features/users/user-repository";
import {
  AuthenticateUserDTO,
  CreateUserDTO,
} from "@/features/users/user-schema";
import { UserService } from "@/features/users/user-service";
import { jwt } from "@/http/lib/jwt";
import { HandlerRequest } from "@/http/lib/types";

const userService = new UserService(new UserRepository());

export async function postUser(
  req: HandlerRequest<CreateUserDTO>,
  res: Response,
) {
  const result = await userService.createUser(req.body);
  if (result === null) {
    return res.status(400).json({ message: "Invalid e-mail or password." });
  }
  res.status(201).json({ token: jwt.sign(result.id) });
}

export async function postAuthenticate(
  req: HandlerRequest<AuthenticateUserDTO>,
  res: Response,
) {
  const result = await userService.authenticateUser(req.body);
  if (result === null) {
    return res.status(401).json({ message: "Invalid e-mail or password." });
  }
  res.json({ token: jwt.sign(result.id) });
}
