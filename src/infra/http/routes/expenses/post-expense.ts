import { Request, Response } from "express";
import { z } from "zod";

import { CreateExpense } from "@/features/expenses/CreateExpense";
import { formatZodIssues, logger, numberHelper } from "@/infra/common";

const validationSchema = z.object({
  description: z.string(),
  amount: z.string().refine((val) => numberHelper.isValid(val)),
  date: z
    .string()
    .date()
    .transform((val) => new Date(val)),
});

export const createExpenseHandler =
  (useCase: CreateExpense) => async (req: Request, res: Response) => {
    const { success, data, error } = validationSchema.safeParse(req.body);

    if (success === false || !data)
      return res.status(400).json({ message: formatZodIssues(error.issues) });

    try {
      const expense = await useCase.perform(req.userId!, data);

      if (expense === null)
        return res
          .status(400)
          .json({ message: "Invalid amount or description." });

      return res.status(201).json(expense);
    } catch (e) {
      logger.error("Failed to authenticate user", e);
      return res.status(500).json({ message: "Internal Server Error." });
    }
  };
