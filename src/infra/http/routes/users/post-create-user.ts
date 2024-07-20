import { Request, Response } from "express";
import { z } from "zod";

import { CreateUser } from "@/features/users/CreateUser";
import { formatZodIssues, logger } from "@/infra/common";

import { jwt } from "../../common";

const validationSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    passwordConfirmation: z.string().min(8),
  })
  .refine(
    ({ password, passwordConfirmation }) => password === passwordConfirmation,
    { message: "Password and confirmation mismatch." },
  );

export const createUserHandler =
  (useCase: CreateUser) => async (req: Request, res: Response) => {
    const { success, data, error } = validationSchema.safeParse(req.body);

    if (success === false || !data)
      return res.status(400).json({ message: formatZodIssues(error.issues) });

    try {
      const user = await useCase.perform(
        data.email,
        data.password,
        data.passwordConfirmation,
      );

      if (user === null)
        return res
          .status(400)
          .json({ message: "Email already in use or password mismatch." });

      res.status(201).json({ token: jwt.sign(user.id) });
    } catch (e) {
      logger.error("Failed to create user", e);
      return res.status(500).json({ message: "Internal Server Error." });
    }
  };
