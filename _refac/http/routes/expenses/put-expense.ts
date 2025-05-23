import { Request, Response } from "express";

import { UpdateExpense } from "@/features/expenses/UpdateExpense";
import { badRequest, serverError } from "@/infra/http/common";

export const updateExpenseHandler =
  (useCase: UpdateExpense) => async (req: Request, res: Response) => {
    try {
      const expense = await useCase.perform(
        req.params.id,
        req.userId!,
        req.body,
      );

      if (expense === null)
        return badRequest(res, "Invalid amount or description.");

      return res.status(200).json(expense);
    } catch (e) {
      return serverError(res, e);
    }
  };
