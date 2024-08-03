import { Request, Response } from "express";

import { CreateExpense } from "@/features/expenses/CreateExpense";
import { badRequest, serverError } from "@/infra/http/common";

export const createExpenseHandler =
  (useCase: CreateExpense) => async (req: Request, res: Response) => {
    try {
      const expense = await useCase.perform(req.userId!, req.body);

      if (expense === null)
        return badRequest(res, "Invalid amount or description.");

      return res.status(201).json(expense);
    } catch (e) {
      return serverError(res, e);
    }
  };
