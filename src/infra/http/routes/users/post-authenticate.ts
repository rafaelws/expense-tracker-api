import { Request, Response } from "express";
import { z } from "zod";

import { Authenticate } from "@/features/users/Authenticate";
import { formatZodIssues, logger } from "@/infra/common";

import { jwt } from "../../common";

const validationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authenticateHandler =
  (useCase: Authenticate) => async (req: Request, res: Response) => {
    const { success, data, error } = validationSchema.safeParse(req.body);

    if (success === false || !data)
      return res.status(400).json({ message: formatZodIssues(error.issues) });

    try {
      const user = await useCase.perform(data.email, data.password);

      if (user === null)
        return res.status(401).json({ message: "Invalid e-mail or password." });

      res.json({ token: jwt.sign(user.id) });
    } catch (e) {
      logger.error("Failed to authenticate user", e);
      return res.status(500).json({ message: "Internal Server Error." });
    }
  };
