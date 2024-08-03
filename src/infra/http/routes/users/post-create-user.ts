import { Request, Response } from "express";

import { CreateUser } from "@/features/users/CreateUser";
import { badRequest, serverError } from "@/infra/http/common";

import { jwt } from "../../common";

export const createUserHandler =
  (useCase: CreateUser) => async (req: Request, res: Response) => {
    try {
      const user = await useCase.perform(
        req.body.email,
        req.body.password,
        req.body.passwordConfirmation,
      );

      if (user === null) return badRequest(res, "Invalid e-mail or password.");

      return res.status(201).json({ token: jwt.sign(user.id) });
    } catch (e) {
      return serverError(res, e);
    }
  };
