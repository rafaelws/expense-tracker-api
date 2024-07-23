import { Request, Response } from "express";

import { Authenticate } from "@/features/users/Authenticate";
import { serverError } from "@/infra/common";

import { jwt } from "../../common";

export const authenticateHandler =
  (useCase: Authenticate) => async (req: Request, res: Response) => {
    try {
      const user = await useCase.perform(req.body.email, req.body.password);

      if (user === null)
        return res.status(401).json({ message: "Invalid e-mail or password." });

      return res.json({ token: jwt.sign(user.id) });
    } catch (e) {
      return serverError(res, e);
    }
  };
